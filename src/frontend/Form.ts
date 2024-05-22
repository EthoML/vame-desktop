import { header } from './utils/text'

class Form {

    element: HTMLFormElement = document.createElement('form')

    constructor(element: HTMLFormElement) {
        if (element) this.element = element
    }
  
    export = () => {
      const formData = new FormData(this.element)
      const object: Record<string, any> = {}

      const allLabels = this.element.querySelectorAll('label')

     allLabels.forEach(label => {

        const key = label.htmlFor
        const element = this.element.querySelector(`[name="${key}"]`) as HTMLInputElement
        
        const value = formData.get(key)

        if (value === undefined) return
        if (value instanceof File && !value.path) return

        
        if (element.type === 'checkbox') return object[key] = element.checked
        if (element.type === 'number') return object[key] = Number(value)
        if (!Reflect.has(object, key)) return object[key] = value
        if (!Array.isArray(object[key])) object[key] = [object[key]]
        object[key].push(value)
      })
  
      return object

    }

    clear = () => {
        this.element.innerHTML = ''
    }
  
    load = (data: Record<string, any>) => {

        this.element.innerHTML = ''

        // Create a form with the proper inputs from the data
        // and set the values of the form to the values of the data
        const elements = Object.entries(data).map(([key, value]) => {
            const group = document.createElement('div')

            const left = document.createElement('div')
            const right = document.createElement('div')
            group.append(left, right)

            const label = document.createElement('label')
            label.innerText = header(key)
            label.setAttribute('for', key)
            left.append(label)


            const inputType = typeof value

            const input = document.createElement('input')
            input.name = key

            if (inputType === 'boolean' || value === null) {
                input.type = 'checkbox'
                input.checked = value
                right.append(input)
                return group
            }
            
            input.type = inputType === 'number' ? 'number' : 'text'
            input.value = value
            right.append(input)

            return group
        })

        this.element.append(...elements)

    }
  }

  export default Form