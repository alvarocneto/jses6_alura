import {HttpService} from './HttpService.js'
import {ConnectionFactory} from './ConnectionFactory.js'
import {Negociacao} from '../models/Negociacao.js'
import {NegociacaoDao} from '../dao/NegociacaoDao.js'

export class NegociacaoService {
  constructor () {
    this.http = new HttpService()
  }
/*
xhr.readyState
0: requisição ainda não iniciada.
1: conexão com o servidor estabelecida.
2: requisição recebida.
3: processando requisição.
4: requisição concluída e a resposta esta pronta.
*/
  _obterNegociacoes (url, msgerro) {
    return new Promise((resolve, reject) => {
      this.http
                .get(url)
                .then(negociacoes => {
                  resolve(negociacoes.map(objeto => new Negociacao(new Date(objeto.data), objeto.quantidade, objeto.valor)))
                })
                .catch(erro => {
                  console.log(erro)
                  reject(msgerro)
                })
    })
  }

  obterNegociacoesDaSemana () {
    return this._obterNegociacoes('negociacoes/semana', 'Não foi possível obter as negociações da semana')
  }

  obterNegociacoesDaSemanaAnterior () {
    return this._obterNegociacoes('negociacoes/anterior', 'Não foi possível obter as negociações da semana anterior')
  }

  obterNegociacoesDaSemanaRetrasada (cb) {
    return this._obterNegociacoes('negociacoes/retrasada', 'Não foi possível obter as negociações da semana Retrasada')
  }

  obterNegociacoes () {
    return Promise.all([
      this.obterNegociacoesDaSemana(),
      this.obterNegociacoesDaSemanaAnterior(),
      this.obterNegociacoesDaSemanaRetrasada()
    ]).then(periodos => {
      let negociacoes = periodos
                .reduce((dados, periodo) => dados.concat(periodo), [])
                .map(dado => new Negociacao(new Date(dado.data), dado.quantidade, dado.valor))
      return negociacoes
    }).catch(erro => {
      throw new Error(erro)
    })
  }

  cadastra (negociacao) {
    return ConnectionFactory
            .getConnection()
            .then(conexao => new NegociacaoDao(conexao))
            .then(dao => dao.adiciona(negociacao))
            .then(() => 'Negociação cadastrada com sucesso')
            .catch(erro => {
              console.log(erro)
              throw new Error('Não foi possível adicionar a negociação')
            })
  }

  lista () {
    return ConnectionFactory
          .getConnection()
          .then(connection => new NegociacaoDao(connection))
          .then(dao => dao.listaTodos())
          .catch(erro => {
            console.log(erro)
            throw new Error('Não foi possível obter as negociações')
          })
  }

  apaga () {
    return ConnectionFactory
        .getConnection()
        .then(connection => new NegociacaoDao(connection))
        .then(dao => dao.apagaTodos())
        .then(() => 'Negociações apagadas com sucesso')
        .catch(erro => {
          console.log(erro)
          throw new Error('Não foi possível apagar as negociações')
        })
  }

  importa (listaAtual) {
    return this.obterNegociacoes()
           .then(negociacoes =>
               negociacoes.filter(negociacao =>
                   !listaAtual.some(negociacaoExistente =>
                       JSON.stringify(negociacao) === JSON.stringify(negociacaoExistente)))
           )
           .catch(erro => {
             console.log(erro)
             throw new Error('Não foi possível importar as negociações')
           })
  }
}
