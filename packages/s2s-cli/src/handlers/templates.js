// @flow
import path from 'path'
import chalk from 'chalk'
import cpFile from 'cp-file'
import type { Path, Template } from 'types'
import { formatText, trimAndFormatPath } from '../reporters'
import { log, isAlreadyExist, relativeFromCwd, getOutputPath } from '../utils'

function handleCopyError(err: Error & { path: string, code: string }): void {
  if (err.name === 'CpFileError' && err.code === 'ENOENT') {
    const errorText = `${chalk.reset.inverse.bold.red(
      'TEMPLATE'
    )} ${trimAndFormatPath(err.path)}
          no such file or directory`
    log(errorText)
  } else {
    log(err.stack)
  }
}

const DEFAULT_TEMPLATES_DIR = 'templates'

function handleTemplate(
  eventPath: Path,
  template: Template,
  templatesDir: string
) {
  if (!template.test.test(eventPath)) {
    return
  }

  const outputPath = template.output
    ? getOutputPath(template.output, eventPath)
    : eventPath

  if (isAlreadyExist(outputPath)) {
    return
  }

  const templatePath = path.join(templatesDir, template.input)
  cpFile.sync(templatePath, outputPath)

  log(formatText('TEMPLATE', relativeFromCwd(templatePath), outputPath))
}

export default function handleTemplates(
  eventPath: Path,
  templates: Template[] = [],
  templatesDir: string = DEFAULT_TEMPLATES_DIR
) {
  for (const template of templates) {
    try {
      handleTemplate(eventPath, template, templatesDir)
    } catch (err) {
      handleCopyError(err)
    }
  }
}
