const decorationWarning =
  "Pull request decoration did not happen. Property 'sonar.pullrequest.provider' was missing.";

export function validateCloudTask(task, { project, pullRequest, binding }) {
  if (
    task?.status !== 'SUCCESS' ||
    !task.analysisId ||
    task.componentKey !== project ||
    !Array.isArray(task.warnings) ||
    task.warningCount !== task.warnings.length
  )
    throw new Error('Tarea Cloud incompleta o con advertencias');
  const integrationWarnings = task.warnings.filter(
    (warning) =>
      Boolean(pullRequest) && binding?.is_bound === false && warning === decorationWarning,
  );
  if (integrationWarnings.length !== task.warnings.length)
    throw new Error('Advertencia de análisis Cloud no permitida');
  return { analysisWarnings: 0, integrationWarnings };
}
