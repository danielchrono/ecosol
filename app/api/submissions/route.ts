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
  try {
    const body = await req.json();
    
    // 1. Definição da URL Base (Evita o 'undefined')
    // Prioriza o ENV, mas tem um fallback para o seu domínio oficial
    const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://ecosol-omega.vercel.app";

    // 2. Cria o registro do serviço no banco
    const created = await prisma.service.create({ 
      data: { ...body, approved: false } 
    });

    if (created.id) {
      // 3. BUSCA TODOS OS ADMINS NO BANCO
      const admins = await prisma.user.findMany({
        where: { role: 'ADMIN' },
        select: { email: true }
      });

      const emailPromises = [];

      // 4. NOTIFICAÇÃO PARA TODOS OS ADMINS
      if (admins.length > 0) {
        admins.forEach(admin => {
          if (!admin.email) return;
          emailPromises.push(
            transporter.sendMail({
              from: `"Sistema Ecosol" <${process.env.GMAIL_USER}>`,
              to: admin.email,
              subject: '🚨 Nova Aprovação Pendente - Ecosol',
              html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 20px; padding: 30px;">
                  <h2 style="color: #0f172a;">Olá Admin, há um novo cadastro!</h2>
                  <p>O negócio <strong>${body.name}</strong> aguarda sua revisão.</p>
                  <div style="margin-top: 25px;">
                    <a href="${SITE_URL}/admin/dashboard" 
                       style="background: #2563eb; color: white; padding: 12px 24px; border-radius: 10px; text-decoration: none; display: inline-block; font-weight: bold;">
                       Acessar Painel de Aprovação
                    </a>
                  </div>
                </div>
              `
            })
          );
        });
      }

      // 5. NOTIFICAÇÃO PARA O OWNER (Criador)
      if (body.email) {
        emailPromises.push(
          transporter.sendMail({
            from: `"Ecosol" <${process.env.GMAIL_USER}>`,
            to: body.email,
            subject: '🌿 Recebemos seu cadastro - Ecosol',
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 20px; padding: 30px;">
                <h2 style="color: #2563eb;">Recebemos sua submissão!</h2>
                <p>O negócio <strong>${body.name}</strong> está em fase de análise pela nossa curadoria.</p>
                <p>Você receberá um novo e-mail assim que ele for publicado.</p>
                <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
                <p style="font-size: 12px; color: #64748b;">Equipe Ecosol Entre Autistas</p>
              </div>
            `
          })
        );
      }

      // Dispara todos os e-mails simultaneamente
      await Promise.all(emailPromises).catch(err => 
        console.error("Erro na fila de e-mails:", err)
      );
    }

    return NextResponse.json({ ok: true, id: created.id });
  } catch (err) {
    console.error("Erro na submissão:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}