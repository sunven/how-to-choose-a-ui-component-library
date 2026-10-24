declare module 'postcss-prefix-selector' {
  import type { PluginCreator, Rule } from 'postcss'

  interface PrefixSelectorOptions {
    prefix: string
    exclude?: (string | RegExp)[]
    transform?: (
      prefix: string,
      selector: string,
      prefixedSelector: string,
      filePath: string,
      rule: Rule,
    ) => string
    ignoreFiles?: (string | RegExp)[]
    includeFiles?: (string | RegExp)[]
    skipGlobalSelectors?: boolean
  }

  const prefixSelector: PluginCreator<PrefixSelectorOptions>
  export default prefixSelector
}
