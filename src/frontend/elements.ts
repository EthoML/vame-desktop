export const createProjectButton = document.querySelector("#create-project")!


export const runPipelineButton = document.querySelector("#run-pipeline")!
runPipelineButton.setAttribute('disabled', '')

const navButtonElements = document.querySelectorAll('#controls button')
const navSectionNames = Array.from(navButtonElements).map(el => el.id.replace('-button', ''))

export const sections = navSectionNames.reduce((acc, section) => {
    const el = document.querySelector(`#${section}`) as HTMLDivElement
    if (el) acc[section] = el
    return acc
}, {}) as Record<string, HTMLDivElement>

export const sectionButtons = navSectionNames.reduce((acc, name) => {
    acc[name] = document.querySelector(`#${name}-button`)! as HTMLButtonElement
    return acc
  }, {})


export const mainConsoleElement = sections.edit.querySelector('.console')!;

export const imageRenderElement = sections.edit.querySelector('.image-render')!;
