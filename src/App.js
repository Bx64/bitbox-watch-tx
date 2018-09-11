import * as BITBOXCli from 'bitbox-cli/lib/bitbox-cli'
import * as React from 'react'
import Transaction from './Transaction';

const BITBOX = new BITBOXCli.default()
const socket = new BITBOX.Socket()

class App extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      addrs: [],
      input: '',
      txs: []
    }
  }

  componentDidMount() {
    socket.listen('transactions', this.handleNewTx)
  }

  render() {
    return (
      <div>
        <h1>BCH Transaction Watcher Powered by BITBOX</h1>
        <h2>Watching Addresses</h2>
        <form onSubmit={this.handleSubmit}>
          <input
            type='text'
            value={this.state.input}
            onChange={this.handleChangeText}
            placeholder='Watch address [Enter]'
          />
        </form>
        <ul>
          {this.state.addrs.map((addr, idx) =>
            <li key={idx}><p>{addr}</p></li>
          )}
        </ul>
        <h2>Watching transactions</h2>
        <ul>
          {this.state.txs.map((tx, idx) => 
            <li key={idx}><Transaction id={tx.format.txid} /></li>
          )}
        </ul>
      </div>
    )
  }

  handleSubmit = (event) => {
    event.preventDefault()
    
    const input = this.state.input

    try {
      if (!BITBOX.Address.isMainnetAddress(input)) {
        return
      }
    } catch (e) {
      return
    }

    if (this.state.addrs.indexOf(input) >= 0) {
      return
    }

    this.setState({
      addrs: this.state.addrs.concat(input),
      input: ''
    })
  }

  handleChangeText = (event) => 
    this.setState({
      input: event.currentTarget.value
    })

  handleNewTx = (msg) => {
    const tx = JSON.parse(msg)

    const txAddrs = tx.outputs
      .map((output) => output.scriptPubKey.addresses)
      .reduce((acc, x) => acc.concat(x, []))
    const found = this.state.addrs
      .map(addr => BITBOX.Address.toLegacyAddress(addr))
      .filter(addr => txAddrs.indexOf(addr) !== -1).length > 0
    if (!found) {
      return
    }

    this.setState({
      txs: this.state.txs.concat(tx)
    })
  }
}

export default App