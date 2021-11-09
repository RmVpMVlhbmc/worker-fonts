function fetchX(url, init) {
  return new Promise((resolve, reject) => {
    fetch(url, init).then(
      res => {
        if (res.ok == true) {
          return resolve(res)
        } else {
          return reject(new Error(`${res.status} ${res.statusText}`))
        }
      },
      err => {
        return reject(err.message)
      },
    )
  })
}

export { fetchX }
