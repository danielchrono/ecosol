import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

export async function POST(req: Request) {
  // 1. CORREÇÃO VITAL: await cookies() para Next.js moderno (2025/2026)
  const cookieStore = await cookies()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          // Agora o TS reconhece o getAll() pois o cookieStore foi "aguardado"
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              // Versão compatível com Next.js moderno
              cookieStore.set({ name, value, ...options })
            )
          } catch (error) {
            console.error(error);
          }
        },
      },
    }
  )

  try {
    // 2. VERIFICAÇÃO DE SEGURANÇA
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { ok: false, error: "Acesso não autorizado. Faça login para continuar." },
        { status: 401 }
      )
    }

    const body = await req.json();
    const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://ecosol-omega.vercel.app";

    // 3. REGISTRO NO PRISMA (Usando o e-mail autenticado do Supabase)
    const created = await prisma.service.create({ 
      data: { 
        ...body, 
        approved: false,
        email: user.email 
      } 
    });

    if (created.id) {
      // 4. LOGÍSTICA DE NOTIFICAÇÃO (ADM)
      const admins = await prisma.user.findMany({
        where: { role: 'ADMIN' },
        select: { email: true }
      });

      const emailPromises = [];

      if (admins && admins.length > 0) {
        admins.forEach(admin => {
          if (!admin.email) return;
          emailPromises.push(
            transporter.sendMail({
              from: `"Sistema Ecosol" <${process.env.GMAIL_USER}>`,
              to: admin.email,
              subject: '🚨 Nova Aprovação Pendente - Ecosol',
              html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 20px; padding: 30px;">
                  <h2 style="color: #0f172a; font-weight: 900;">Olá Admin!</h2>
                  <p style="color: #475569; line-height: 1.6;">
                    Existe um novo negócio aguardando sua revisão: <strong>${body.name}</strong>.
                  </p>
                  <div style="margin-top: 25px;">
                    <a href="${SITE_URL}/admin/dashboard" 
                       style="background: #2563eb; color: white; padding: 12px 24px; border-radius: 10px; text-decoration: none; display: inline-block; font-weight: bold;">
                       Acessar Painel Administrativo
                    </a>
                  </div>
                </div>
              `
            })
          );
        });
      }

      // 5. NOTIFICAÇÃO PARA O OWNER (USUÁRIO LOGADO)
      if (user.email) {
        emailPromises.push(
          transporter.sendMail({
            from: `"Ecosol" <${process.env.GMAIL_USER}>`,
            to: user.email,
            subject: '🌿 Recebemos seu cadastro - Ecosol',
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 20px; padding: 30px;">
                <h2 style="color: #2563eb; font-weight: 900;">Submissão Recebida!</h2>
                <p style="color: #475569; line-height: 1.6;">
                  Obrigado por cadastrar o negócio <strong>${body.name}</strong>. 
                  Sua publicação entrará em fase de curadoria e você será avisado por aqui assim que for aprovada.
                </p>
                <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
                <p style="font-size: 12px; color: #94a3b8; text-align: center;">Equipe Ecosol Entre Autistas</p>
              </div>
            `
          })
        );
      }

      // Envia todos os e-mails simultaneamente
      await Promise.all(emailPromises);
    }

    return NextResponse.json({ ok: true, id: created.id });
  } catch (err) {
    console.error("Erro crítico na submissão:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}