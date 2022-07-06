import { isStr } from './isStr'
import { preload } from './preload'
import { addEventListener } from './addEventListener'
import { createElement } from './createElement'

export function waterfall(imageList: string[], container: string | HTMLElement, width = 200, space = 20) {
  const imagesElement = preload(imageList, `width:${width}px;position:absolute;`)
  const wrapper = createElement('div', {
    id: 'simon-waterfall',
    style: 'position:relative;width:100%;height:100%;',
  })
  addEventListener(document, 'DOMContentLoaded', load)
  addEventListener(window, 'resize', update)
  async function update() {
    if (isStr(container)) {
      console.warn('请刷新页面后重试')
      return
    }
    const realWidth = width + space
    const n = Math.floor((container as HTMLElement).offsetWidth / realWidth)
    const H = new Array(n).fill(0)
    function resize(images: HTMLImageElement[]) {
      return images.map((image) => {
        const tag = H.indexOf(Math.min(...H))
        const h = image.height * width / image.width
        image.style.left = `${tag * realWidth}px`
        image.style.top = `${H[tag]}px`
        H[tag] += h + space
        return image
      })
    }
    function promiseElements(): Promise<HTMLImageElement[]> {
      return new Promise((resolve) => {
        const result: HTMLImageElement[] = []
        let count = imagesElement.length
        imagesElement.forEach((image, idx) => {
          if (!image.complete) {
            image.onload = () => {
              count--
              result[idx] = image
              if (count === 0)
                resolve(resize(result))
            }
          }
          else {
            count--
            result[idx] = image
            if (count === 0)
              resolve(resize(result))
          }
        })
      })
    }
    (await promiseElements()).forEach(image => wrapper.appendChild(image));

    (container as HTMLElement).append(wrapper)
  }
  function load() {
    if (isStr(container))
      container = document.querySelector(container as string) as HTMLElement || container
    if (isStr(container))
      container = document.body as HTMLElement
    update()
  }
  return (imageList: string[]) => {
    const appendElement = preload(imageList, `width:${width}px;position:absolute;`)
    imagesElement.push(...appendElement)
    update()
  }
}
