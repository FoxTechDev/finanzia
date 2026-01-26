export enum RoleCodes {
  ADMIN = 'ADMIN',
  ASESOR = 'ASESOR',
  COMITE = 'COMITE',
}

export const RoleDescriptions: Record<RoleCodes, string> = {
  [RoleCodes.ADMIN]: 'Administrador del sistema con acceso completo',
  [RoleCodes.ASESOR]: 'Asesor de negocio con acceso a clientes y solicitudes',
  [RoleCodes.COMITE]: 'Comité de crédito con acceso a decisiones de crédito',
};
