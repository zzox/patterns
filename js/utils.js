export const validKeys = ['abcdefghijklmnopqrstuvwxyz0123456789,./-=']

const modalElement = document.getElementById('popup')
const modalButtons = document.getElementById('popup-buttons')

export const makeDiv = (className) => {
  const div = document.createElement('div')
  div.className = className
  return div
}

export const removeChildElements = (element) => {
  Array.from(element.children).map((el) => el.remove())
}

export const showModal = (title, subtext = '', buttons = []) => {
  removeChildElements(modalButtons)
  modalElement.children[0].innerText = title
  modalElement.children[1].innerHTML = subtext
  modalElement.style.visibility = 'visible'
  modalElement.style.opacity = 1

  buttons.forEach(({ text, callback }) => {
    const button = document.createElement('button')
    button.innerText = text
    button.onclick = () => {
      hideModal()
      callback()
    }
    modalElement.appendChild(button)
  })
}

export const hideModal = async () => {
  modalElement.style.opacity = 0
  await sleep(125)
  modalElement.style.visibility = 'hidden'
}

export const timeToDisplay = (time) =>
  (time / 1000).toFixed(3).split('.').join('\'<small>') + "\"</small>"

export const sleep = (time) => new Promise((res) => setTimeout(res, time))
