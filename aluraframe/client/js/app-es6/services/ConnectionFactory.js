  const stores = ['negociacoes']
  const version = 4
  const dbName = 'aluraframe'
  let connection = null

  export class ConnectionFactory {
    constructor () {
      throw new Error('Não é possível criar instâncias de ConnectinFactory')
    }
    static getConnection () {
      return new Promise((resolve, reject) => {
        let openRequest = window.indexedDB.open(dbName, version)

        openRequest.onupgradeneeded = e => {
          ConnectionFactory._createStores(e.target.result)
        }

        openRequest.onsuccess = e => {
          if (!connection) {
            connection = e.target.result
            close = connection.close
            connection.close = function () {
              throw new Error('Você não pode fechar diretamente a conexão')
            }
          }
          resolve(connection)
        }
        openRequest.onerror = e => {
          console.log(e.target.error)

          reject(e.target.error.name)
        }
      })
    }

    static closeConnection () {
      if (connection) {
        connection.close()
        connection = null
      }
    }
    static _createStores (connection) {
      stores.forEach(store => {
        if (connection.objectStoreNames.contains(store)) connection.deleteObjectStore(store)
        connection.createObjectStore(store, { autoIncrement: true })
      })
    }
    }
