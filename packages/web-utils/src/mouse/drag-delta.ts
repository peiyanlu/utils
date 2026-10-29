export const mouseDragDelta = (
  element: HTMLElement,
  callback: (dx: number, dy: number) => void,
  threshold: number = 3,
): () => void => {
  let dragged = false
  
  let downX = 0
  let downY = 0
  
  let lastX = 0
  let lastY = 0
  
  const userSelect = element.style.userSelect
  const cursor = element.style.cursor
  
  const onMouseMove = (event: MouseEvent): void => {
    const moved =
      Math.abs(event.clientX - downX) >= threshold ||
      Math.abs(event.clientY - downY) >= threshold
    
    dragged ||= moved
    
    const dx = event.clientX - lastX
    const dy = event.clientY - lastY
    
    lastX = event.clientX
    lastY = event.clientY
    
    callback(dx, dy)
  }
  
  const onMouseUp = (): void => {
    element.style.userSelect = userSelect
    element.style.cursor = cursor
    
    element.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mouseup', onMouseUp)
    window.removeEventListener('blur', onMouseUp)
  }
  
  const onMouseDown = (event: MouseEvent): void => {
    if (event.button !== 0) return
    
    event.preventDefault()
    
    dragged = false
    
    downX = lastX = event.clientX
    downY = lastY = event.clientY
    
    element.style.userSelect = 'none'
    element.style.cursor = 'grabbing'
    
    element.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    window.addEventListener('blur', onMouseUp)
  }
  
  const onClick = (event: PointerEvent): void => {
    if (!dragged) return
    
    dragged = false
    
    event.preventDefault()
    event.stopImmediatePropagation()
  }
  
  element.addEventListener('mousedown', onMouseDown)
  element.addEventListener('click', onClick, true)
  
  return () => {
    onMouseUp()
    
    element.removeEventListener('mousedown', onMouseDown)
    element.removeEventListener('click', onClick, true)
  }
}


export const pointerDragDelta = (
  element: HTMLElement,
  callback: (dx: number, dy: number) => void,
  threshold: number = 3,
): () => void => {
  let dragged = false
  
  let downX = 0
  let downY = 0
  
  let lastX = 0
  let lastY = 0
  
  const userSelect = element.style.userSelect
  const cursor = element.style.cursor
  
  const onPointerMove = (event: PointerEvent): void => {
    const moved =
      Math.abs(event.clientX - downX) >= threshold ||
      Math.abs(event.clientY - downY) >= threshold
    
    dragged ||= moved
    
    const dx = event.clientX - lastX
    const dy = event.clientY - lastY
    
    lastX = event.clientX
    lastY = event.clientY
    
    callback(dx, dy)
  }
  
  const onPointerUp = (): void => {
    
    element.style.userSelect = userSelect
    element.style.cursor = cursor
    
    element.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerup', onPointerUp)
    window.removeEventListener('blur', onPointerUp)
  }
  
  const onPointerDown = (event: PointerEvent): void => {
    if (event.button !== 0) return
    
    event.preventDefault()
    
    dragged = false
    
    downX = lastX = event.clientX
    downY = lastY = event.clientY
    
    element.style.userSelect = 'none'
    element.style.cursor = 'grabbing'
    
    element.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    window.addEventListener('blur', onPointerUp)
  }
  
  const onClick = (event: PointerEvent): void => {
    if (!dragged) return
    
    dragged = false
    
    event.preventDefault()
    event.stopImmediatePropagation()
  }
  
  element.addEventListener('pointerdown', onPointerDown)
  element.addEventListener('click', onClick, true)
  
  return () => {
    onPointerUp()
    
    element.removeEventListener('pointerdown', onPointerDown)
    element.removeEventListener('click', onClick, true)
  }
}
