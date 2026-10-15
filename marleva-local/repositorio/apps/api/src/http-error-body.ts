export function httpErrorBody(status: number, response: unknown, requestId: string) {
  const fields =
    response && typeof response === 'object' ? (response as Record<string, unknown>) : {};
  const fallback =
    status >= 500
      ? ['DEPENDENCIA', 'Una dependencia local no está disponible']
      : ['SOLICITUD', 'Revisa la solicitud e intenta de nuevo'];
  return {
    codigo: typeof fields.codigo === 'string' ? fields.codigo : fallback[0],
    mensaje: typeof fields.mensaje === 'string' ? fields.mensaje : fallback[1],
    accion_recuperacion:
      typeof fields.accion_recuperacion === 'string'
        ? fields.accion_recuperacion
        : 'Intenta de nuevo o solicita ayuda',
    request_id: requestId,
  };
}
