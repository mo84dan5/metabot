export async function waitAndReturn() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve('DONE')
    }, 5000)
  })
}
