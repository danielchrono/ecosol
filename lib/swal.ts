import Swal, { SweetAlertResult } from 'sweetalert2';

/**
 * 1. BASES DE ESTILO - Apenas estilos, SEM classes CSS customizadas
 */
const BUTTON_STYLES = {
  BASE: `
    !h-12 !px-8 !rounded-xl 
    !text-[10px] !font-black !uppercase !tracking-[0.2em] 
    !transition-all !duration-300 !border-none !outline-none 
    !flex !items-center !justify-center !cursor-pointer
  `,
  
  CONFIRM_PRIMARY: `
    !bg-primary !text-primary-foreground 
    hover:!brightness-110 active:!scale-95
  `,
  
  CONFIRM_DESTRUCTIVE: `
    !bg-destructive !text-white 
    hover:!brightness-110 active:!scale-95
  `,
  
  CANCEL_PRIMARY: `
    !bg-destructive/10 !text-destructive !border !border-destructive/20
    hover:!bg-destructive hover:!text-white
    active:!scale-95 !ml-3
  `,
  
  CANCEL_DESTRUCTIVE: `
    !bg-muted/30 !text-foreground/80 !border !border-border/50
    hover:!bg-muted/50 hover:!text-foreground
    active:!scale-95 !ml-3
  `
} as const;

// Botões pré-montados
const btnConfirmPrimary = `${BUTTON_STYLES.BASE} ${BUTTON_STYLES.CONFIRM_PRIMARY}`;
const btnConfirmDestructive = `${BUTTON_STYLES.BASE} ${BUTTON_STYLES.CONFIRM_DESTRUCTIVE}`;
const btnCancelPrimary = `${BUTTON_STYLES.BASE} ${BUTTON_STYLES.CANCEL_PRIMARY}`;
const btnCancelDestructive = `${BUTTON_STYLES.BASE} ${BUTTON_STYLES.CANCEL_DESTRUCTIVE}`;

/**
 * 2. ESTRUTURA DO POPUP
 */
const POPUP_BASE = '!rounded-2xl !p-8 !bg-card !text-foreground !border-[0.5px]';
const SHADOWS = {
  NEON_BLUE: '!shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5),0_0_20px_hsl(var(--primary)/0.2)]',
  NEON_RED: '!shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5),0_0_20px_hsl(var(--destructive)/0.2)]',
  NEON_GREEN: '!shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5),0_0_20px_hsl(var(--success)/0.2)]'
} as const;

// Animations
const SWAL_SHOW_CLASS = { 
  popup: 'animate__animated animate__fadeInDown animate__faster' 
};

const SWAL_HIDE_CLASS = { 
  popup: 'animate__animated animate__fadeOutUp animate__faster' 
};

/**
 * 3. CONFIGURAÇÃO BASE - IMPORTANTE: não usar customClass aqui
 */
const getBaseConfig = () => ({
  backdrop: 'rgba(0,0,0,0.75)',
  buttonsStyling: false, // SweetAlert2 não aplica seus estilos
  showConfirmButton: true,
  showCancelButton: false,
  confirmButtonText: 'Confirmar',
  cancelButtonText: 'Cancelar',
  showClass: SWAL_SHOW_CLASS,
  hideClass: SWAL_HIDE_CLASS,
});

/**
 * 4. HELPER PARA AÇÕES DESTRUTIVAS - COM customClass COMPLETO
 */
export const confirmDestructiveAction = (
  title: string, 
  text: string,
  confirmText: string = 'Confirmar Exclusão',
  cancelText: string = 'Cancelar'
): Promise<SweetAlertResult> => {
  return Swal.fire({
    ...getBaseConfig(),
    title,
    text,
    icon: 'warning' as const,
    iconColor: 'hsl(var(--destructive))',
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    customClass: {
      popup: `${POPUP_BASE} !border-destructive/40 ${SHADOWS.NEON_RED}`,
      confirmButton: btnConfirmDestructive,
      cancelButton: btnCancelDestructive,
      title: '!text-2xl !font-black !uppercase !tracking-tight',
      htmlContainer: '!text-sm !text-muted-foreground !font-medium !mt-4',
      actions: '!flex !items-center !justify-center !mt-8 !gap-0',
    }
  });
};

/**
 * 5. CONFIRMAÇÃO GENÉRICA
 */
export const confirmAction = (
  options: {
    title: string;
    text: string;
    confirmText?: string;
    cancelText?: string;
    icon?: 'warning' | 'question' | 'info';
    theme?: 'primary' | 'destructive';
  }
): Promise<SweetAlertResult> => {
  const isDestructive = options.theme === 'destructive';
  
  return Swal.fire({
    ...getBaseConfig(),
    title: options.title,
    text: options.text,
    icon: options.icon || 'question',
    iconColor: isDestructive 
      ? 'hsl(var(--destructive))' 
      : 'hsl(var(--primary))',
    showCancelButton: true,
    confirmButtonText: options.confirmText || 'Confirmar',
    cancelButtonText: options.cancelText || 'Cancelar',
    customClass: {
      popup: `${POPUP_BASE} ${
        isDestructive 
          ? `!border-destructive/40 ${SHADOWS.NEON_RED}` 
          : `!border-primary/40 ${SHADOWS.NEON_BLUE}`
      }`,
      confirmButton: isDestructive ? btnConfirmDestructive : btnConfirmPrimary,
      cancelButton: isDestructive ? btnCancelDestructive : btnCancelPrimary,
      title: '!text-2xl !font-black !uppercase !tracking-tight',
      htmlContainer: '!text-sm !text-muted-foreground !font-medium !mt-4',
      actions: '!flex !items-center !justify-center !mt-8 !gap-0',
    }
  });
};

/**
 * 6. MODAL DE LOADING
 */
export const showLoading = (title: string = 'Processando...'): Promise<SweetAlertResult> => {
  return Swal.fire({
    title,
    didOpen: () => {
      Swal.showLoading();
    },
    allowOutsideClick: false,
    backdrop: `rgba(0,0,0,0.75)`,
    showConfirmButton: false,
    showClass: SWAL_SHOW_CLASS,
    hideClass: SWAL_HIDE_CLASS,
    customClass: {
      popup: `${POPUP_BASE} !border-primary/40 ${SHADOWS.NEON_BLUE}`,
      title: '!text-2xl !font-black !uppercase !tracking-tight',
    }
  });
};

/**
 * 7. TOAST - USANDO A VERSÃO QUE FUNCIONAVA
 */
export const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 2500,
  timerProgressBar: true,
  showClass: { popup: 'animate__animated animate__fadeInRight animate__faster' },
  hideClass: { popup: 'animate__animated animate__fadeOutRight animate__faster' },
  customClass: {
    popup: `
      !w-fit !max-w-[300px] !min-h-0
      !mt-[70px] !mr-4 !ml-4
      !overflow-visible
      !rounded-xl !px-4 !py-2.5
      !border !border-primary/50 
      !shadow-[0_0_15px_hsl(var(--primary)/0.4),inset_0_0_8px_hsl(var(--primary)/0.1)]
      !flex !items-center !gap-3
      !bg-card !text-foreground
    `,
    icon: '!text-[10px] !m-0 !scale-75 !flex',
    title: '!text-[11px] !font-bold !uppercase !tracking-[0.12em] !leading-none !m-0 !p-0',
    timerProgressBar: '!bg-primary/50',
  },
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer);
    toast.addEventListener('mouseleave', Swal.resumeTimer);
  }
});

/**
 * 8. GESTOR DE NOTIFICAÇÕES
 */
export const notify = {
  success: (message: string) => {
    Swal.close();
    Toast.fire({ 
      icon: 'success', 
      title: message,
      iconColor: 'hsl(var(--primary))' 
    });
  },
  
  error: (message: string = 'Erro na operação') => {
    Swal.close();
    Toast.fire({ 
      icon: 'error', 
      title: message,
      iconColor: 'hsl(var(--destructive))' 
    });
  },
  
  info: (message: string) => {
    Swal.close();
    Toast.fire({ 
      icon: 'info', 
      title: message,
      iconColor: 'hsl(var(--secondary))' 
    });
  },
  
  auto: (success: boolean, successMsg: string, errorMsg?: string) => {
    if (success) {
      notify.success(successMsg);
    } else {
      notify.error(errorMsg || 'Falha ao processar');
    }
  }
};

/**
 * 9. NOTIFICAÇÕES DE MODAL (opcional)
 */
export const notifySuccess = (
  title: string, 
  text: string, 
  timer: number = 2200
): Promise<SweetAlertResult> => {
  return Swal.fire({
    ...getBaseConfig(),
    title,
    text,
    icon: 'success' as const,
    iconColor: 'hsl(var(--primary))',
    timer,
    showConfirmButton: false,
    customClass: {
      popup: `${POPUP_BASE} !border-primary/40 ${SHADOWS.NEON_BLUE}`,
      confirmButton: '!hidden',
      cancelButton: '!hidden',
      title: '!text-2xl !font-black !uppercase !tracking-tight',
      htmlContainer: '!text-sm !text-muted-foreground !font-medium !mt-4',
      actions: '!hidden',
    }
  });
};

export const notifyError = (
  title: string, 
  text: string, 
  timer: number = 3000
): Promise<SweetAlertResult> => {
  return Swal.fire({
    ...getBaseConfig(),
    title,
    text,
    icon: 'error' as const,
    iconColor: 'hsl(var(--destructive))',
    timer,
    showConfirmButton: false,
    customClass: {
      popup: `${POPUP_BASE} !border-destructive/40 ${SHADOWS.NEON_RED}`,
      confirmButton: '!hidden',
      cancelButton: '!hidden',
      title: '!text-2xl !font-black !uppercase !tracking-tight',
      htmlContainer: '!text-sm !text-muted-foreground !font-medium !mt-4',
      actions: '!hidden',
    }
  });
};

/**
 * 10. CONFIG PADRÃO (para compatibilidade)
 */
export const swalConfig = {
  backdrop: 'rgba(0,0,0,0.75)',
  buttonsStyling: false,
  showConfirmButton: true,
  showCancelButton: false,
  confirmButtonText: 'Confirmar',
  cancelButtonText: 'Cancelar',
  showClass: SWAL_SHOW_CLASS,
  hideClass: SWAL_HIDE_CLASS,
  customClass: {
    popup: `${POPUP_BASE} !border-primary/40 ${SHADOWS.NEON_BLUE}`,
    confirmButton: btnConfirmPrimary,
    cancelButton: btnCancelPrimary,
    title: '!text-2xl !font-black !uppercase !tracking-tight',
    htmlContainer: '!text-sm !text-muted-foreground !font-medium !mt-4',
    actions: '!flex !items-center !justify-center !mt-8 !gap-0',
  },
};