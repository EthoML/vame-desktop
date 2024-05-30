import { header } from './utils/text'

function exportFormDataToObject(formData) {
    const obj = {};
    
    formData.forEach((value, key) => {
      if (obj[key]) {
        if (Array.isArray(obj[key])) {
          obj[key].push(value);
        } else {
          obj[key] = [obj[key], value];
        }
      } else {
        obj[key] = value;
      }
    });
    
    return obj;
  }

class Form {

    element: HTMLFormElement = document.createElement('form')

    constructor(element: HTMLFormElement) {
        if (element) this.element = element
    }
  
    export = () => {
      const formData = new FormData(this.element)

      const allLabels = this.element.querySelectorAll('label')

      const baseObject: Record<string, any> = exportFormDataToObject(formData)

      // Parse data that isn't handled well by FormData
     allLabels.forEach(label => {
        const key = label.htmlFor
        const element = this.element.querySelector(`[name="${key}"]`) as HTMLInputElement
        const value = formData.get(key)
        if (element.type === 'checkbox') return baseObject[key] = element.checked
        if (element.type === 'number') return baseObject[key] = Number(value)
      })
  
      return baseObject

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