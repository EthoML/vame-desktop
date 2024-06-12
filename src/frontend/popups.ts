export const showTerminalWhileRunning = (callback, label="Terminal Output") => {

    const promise = callback()

    const modalElement = document.createElement('dialog')
    const modalHeader = document.createElement('header')
    const modalContent = document.createElement('section')
    const modalFooter = document.createElement('footer')
    modalElement.append(modalHeader, modalContent, modalFooter)
    const headerText = document.createElement('span')
    headerText.innerText = label
    modalHeader.appendChild(headerText)
    document.body.appendChild(modalElement)

    let locked = true
    const subscription = commoners.plugins.log.subscribe(({ method, args }) => {
        const messageEl = document.createElement('span')
        const message = args.join(' ')
        messageEl.innerText = message.replace('[vame]:', '')
        messageEl.classList.add(method)
        modalContent.appendChild(messageEl)

        modalContent.onscroll = (ev) => {
            if (ev.target !== modalContent) return
            locked = modalContent.scrollHeight - modalContent.scrollTop === modalContent.clientHeight
        }
        
        // Scroll to bottom
        if (locked) modalContent.scrollTop = modalContent.scrollHeight
    })

    // Wait to show the modal
    setTimeout(() => {
        if (modalElement.parentNode) modalElement.showModal()
    }, 500)

    promise
    .then(() => {
        modalElement.remove()
    })
    .catch((e) => {

        // Inside the modalContent element, find the message text and render it red
        const errorMessage = document.createElement('span')
        errorMessage.innerHTML = `<b>Error:</b> ${e.message}`
        modalFooter.append(errorMessage)

        const closeButton = document.createElement('button')
        closeButton.innerText = 'Close'
        closeButton.onclick = () => modalElement.remove()
        modalHeader.append(closeButton)
    })
    .finally(() => {
        commoners.plugins.log.unsubscribe(subscription)
    })

    return promise

}