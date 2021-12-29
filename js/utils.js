export const validKeys = 'abcdefghijklmnopqrstuvwxyz0123456789,./-='.split('')

export const gebi = (id) => document.getElementById(id)

const modalElement = gebi('popup')
const modalButtons = gebi('popup-buttons')

export const makeDiv = (className) => {
  const div = document.createElement('div')
  div.className = className
  return div
}

export const removeChildElements = (element) => {
  Array.from(element.children).forEach((el) => el.remove())
}

export const showModal = (title, subtext = '', buttons = []) => {
  removeChildElements(modalButtons)
  modalElement.children[0].innerText = title
  modalElement.children[1].innerHTML = subtext
  showElement(modalElement)

  buttons.forEach(({ label, callback }) => {
    const button = document.createElement('button')
    button.innerText = label
    button.onclick = () => {
      hideElement(modalElement)
      callback()
    }
    modalButtons.appendChild(button)
  })
}

export const timeToDisplay = (time) =>
  (time / 1000).toFixed(3).split('.').join('\'<small>') + '"</small>'

export const sleep = (time) => new Promise((resolve, reject) => setTimeout(resolve, time))

export const showElement = (element) => {
  element.style.visibility = 'visible'
  element.style.opacity = 1
}

export const hideElement = async (element) => {
  element.style.opacity = 0
  await sleep(125)
  element.style.visibility = 'hidden'
}
