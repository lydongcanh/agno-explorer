export const TOOL_LABELS: Record<string, string> = {
  detect_language: 'Detecting language',
  analyze_style: 'Analyzing style',
  analyze_complexity: 'Analyzing complexity',
  check_naming: 'Checking naming',
  check_security: 'Scanning security',
  apply_fix: 'Apply fix',
}

export const TOOL_ICONS: Record<string, string> = {
  detect_language: '#',
  analyze_style: '≡',
  analyze_complexity: '∿',
  check_naming: '@',
  check_security: '⊗',
}

export function toolLabel(name: string): string {
  return TOOL_LABELS[name] ?? name.replaceAll('_', ' ')
}

export function toolIcon(name: string): string {
  return TOOL_ICONS[name] ?? '▸'
}
