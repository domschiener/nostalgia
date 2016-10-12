function IOTA(settings) {
  this.version = '1.0.8';
  this.addresses = [];
}

/**
  *
  *
**/
IOTA.prototype._key = function(seed, index, length) {
    var subseed = seed.slice();
    for (var i = 0; i < index; i++) {
        for (var j = 0; j < 243; j++) {
            if (++subseed[j] > 1) {
                subseed[j] = -1;
            } else {
                break;
            }
        }
    }

    var state = [];
    Utils.initialize(state);
    Utils.absorb(subseed, state);
    Utils.squeeze(subseed, state);
    Utils.initialize(state);
    Utils.absorb(subseed, state);

    var key = [], offset = 0, buffer = [];
    while (length-- > 0) {
        for (var i = 0; i < 27; i++) {
            Utils.squeeze(buffer, state);
            for (var j = 0; j < 243; j++) {
                key[offset++] = buffer[j];
            }
        }
    }
    return key;
}

/**
  *
  *
**/
IOTA.prototype._digests = function(key) {
    var keyFragment = [], digests = [], buffer = [], state = [];
    for (var i = 0; i < Math.floor(key.length / 6561); i++) {
        keyFragment = key.slice(i * 6561, (i + 1) * 6561);
        for (var j = 0; j < 27; j++) {
            buffer = keyFragment.slice(j * 243, (j + 1) * 243);
            for (var k = 0; k < 26; k++) {
                Utils.initialize(state);
                Utils.absorb(buffer, state);
                Utils.squeeze(buffer, state);
            }
            for (var k = 0; k < 243; k++) {
                keyFragment[j * 243 + k] = buffer[k];
            }
        }
        Utils.initialize(state);
        Utils.absorb(keyFragment, state);
        Utils.squeeze(buffer, state);
        for (var j = 0; j < 243; j++) {
            digests[i * 243 + j] = buffer[j];
        }
    }
    return digests;
}

/**
  *
  *
**/
IOTA.prototype._address = function(digests) {
    var address = [], state = [];
    Utils.initialize(state);
    Utils.absorb(digests, state);
    Utils.squeeze(address, state);
    return address;
}



/**
  *
  *
**/
IOTA.prototype.getNodeInfo = function(callback) {

  var command = {
    'command': 'getNodeInfo'
  }

  this.sendRequest(command, function(error, success) {
    if (!error) {

      if (callback) {

        return callback(null, success);
      } else {

        return success
      }

    } else {
      return callback(error);
    }
  })
}

/**
  *
  *   ALSO DOES GETNODEINFO AUTOMATICALLY
**/
IOTA.prototype.getMilestone = function(callback) {

  var self = this;

  self.getNodeInfo(function(err, nodeInfo) {

    if (!err) {
      var milestoneIndex = nodeInfo.milestoneIndex;

      var command = {
        'command' : 'getMilestone',
        'index'   : milestoneIndex
      }

      self.sendRequest(command, function(error, success) {
        if (!error) {

          if (callback) {

            return callback(null, success);
          } else {

            return success
          }

        } else {
          return callback(error);
        }
      })
    }
  })
}

/**
  *
  *
**/
IOTA.prototype.findTransactions = function(addresses, callback) {

  var command = {
    'command'   : 'findTransactions',
    'addresses' : addresses
  }

  this.sendRequest(command, function(error, success) {
    if (!error) {

      if (callback) {

        return callback(null, success);
      } else {

        return success
      }

    } else {
      return callback(error);
    }
  })
}

/**
  *
  *
**/
IOTA.prototype.getTransactionsToApprove = function(milestone, callback) {

  var command = {
    'command'   : 'getTransactionsToApprove',
    'milestone' : milestone
  }

  this.sendRequest(command, function(error, success) {
    if (!error) {

      if (callback) {

        return callback(null, success);
      } else {

        return success
      }

    } else {
      return callback(error);
    }
  })
}

/**
  *
  *
**/
IOTA.prototype.attachToTangle = function(trunkTransaction, branchTransaction, minWeightMagnitude, trytes, callback) {

  var command = {
    'command'             : 'attachToTangle',
    'trunkTransaction'    : trunkTransaction,
    'branchTransaction'   : branchTransaction,
    'minWeightMagnitude'  : minWeightMagnitude,
    'trytes'              : trytes
  }

  this.sendRequest(command, function(error, success) {
    if (!error) {

      if (callback) {

        return callback(null, success);
      } else {

        return success;
      }

    } else {
      return callback(error);
    }
  })
}

/**
  *
  *
**/
IOTA.prototype.broadcastAndStore = function(trytes, callback) {

  var self = this;

  var broadcastCommand = {
    'command': 'broadcastTransactions',
    'trytes' : trytes,
  }

  self.sendRequest(broadcastCommand, function(error, broadcast) {

    if (!error) {

      var storeCommand = {
        'command': 'storeTransactions',
        'trytes' : trytes,
      }

      self.sendRequest(storeCommand, function(error, stored) {
        if (!error) {
          return callback(null, broadcast);
        }
      })
    }
  })
}

/**
  *
  *
**/
IOTA.prototype.getBalances = function(addresses, callback) {

  var command = {
    'command'   : 'getBalances',
    'threshold' : 100,
    'addresses' : addresses
  }

  this.sendRequest(command, function(error, success) {
    if (!error) {

      if (callback) {

        return callback(null, success);
      } else {

        return success
      }

    } else {
      return callback(error);
    }
  })
}

/**
  *
  *
**/
IOTA.prototype.getInclusionStates = function(milestone, transactions, callback) {

  var command = {
    'command'       : 'getInclusionStates',
    'transactions'  : transactions,
    'tips'          : [milestone]
  }

  this.sendRequest(command, function(error, success) {
    if (!error) {

      if (callback) {

        return callback(null, success);
      } else {

        return success
      }

    } else {
      return callback(error);
    }
  })
}

/**
  *
  *
**/
IOTA.prototype.getTrytes = function(transactions, callback) {

  var command = {
    'command': 'getTrytes',
    'hashes': transactions
  }

  this.sendRequest(command, function(error, success) {
    if (!error) {

      if (callback) {

        return callback(null, success);
      } else {

        return success
      }

    } else {
      return callback(error);
    }
  })
}

/**
  *
  *
**/
IOTA.prototype.analyzeTransactions = function(trytes, callback) {

  var analyzedTrytes = [];

  for (var i = 0; i < trytes.length; i++) {

    analyzedTrytes.push(Utils.transactionObject(trytes[i]));
  }

  return callback(null, analyzedTrytes);
}

/**
  *
  *
**/
IOTA.prototype._addTrytes = function(bundle, signatureFragments) {

  var finalBundle = [];
  var message;

  for (var i = 0; i < bundle.transactions.length; i++) {

    // Fill empty signatureMessageFragment
    bundle.transactions[i].signatureMessageFragment = signatureFragments[i];

    // Fill empty trunkTransaction
    if (bundle.transactions[i].trunkTransaction === undefined) {
      bundle.transactions[i].trunkTransaction = '9';
    }
    for (var j = 0; bundle.transactions[i].trunkTransaction.length < 81; j++) {
      bundle.transactions[i].trunkTransaction += '9';
    }

    // Fill empty branchTransaction
    if (bundle.transactions[i].branchTransaction === undefined) {
      bundle.transactions[i].branchTransaction = '9';
    }
    for (var j = 0; bundle.transactions[i].branchTransaction.length < 81; j++) {
      bundle.transactions[i].branchTransaction += '9';
    }

    // Fill empty nonce
    if (bundle.transactions[i].nonce === undefined) {
      bundle.transactions[i].nonce = '9';
    }
    for (var j = 0; bundle.transactions[i].nonce.length < 81; j++) {
      bundle.transactions[i].nonce += '9';
    }

    finalBundle.push(Utils.transactionTrytes(bundle.transactions[i]));
  }

  return finalBundle;
}


/**
  * getsTrytes, analyzes, gets bundle hashes,
  * findTransactions, trytes, analyzes
  *
**/
IOTA.prototype.getBundle = function(transactions, inclusionStates, callback) {

  var self = this;

  self.getTrytes(transactions, function(error, trytes) {

    if (!error) {

      self.analyzeTransactions(trytes.trytes, function(error, analyzed) {

        var bundleHashes = new Set();
        var bundleInclusions = {}
        for (var i = 0; i < analyzed.length; i++) {
          bundleHashes.add(analyzed[i].bundle);
          bundleInclusions[analyzed[i].bundle] = inclusionStates[transactions.indexOf(analyzed[i].hash)]
        }

        var findTxs = {
          'command': 'findTransactions',
          'bundles': Array.from(bundleHashes)
        }

        self.sendRequest(findTxs, function(error, bundleTxs) {

          self.getTrytes(bundleTxs.hashes, function(error, bundleTrytes) {

            if (!error) {

              return self.analyzeTransactions(bundleTrytes.trytes, function(error, analyzedBundles) {

                var tailTransactions = [];
                /**

                  Bundle the bundles together (list of lists)

                **/
                for (var i = 0; i < analyzedBundles.length; i++) {
                  analyzedBundles[i]['persistence'] = bundleInclusions[analyzedBundles[i].bundle];

                  if (analyzedBundles[i].currentIndex === 0) {
                    tailTransactions.push(analyzedBundles[i]);
                  }
                }

                return callback(null, tailTransactions, analyzedBundles);
              });
            }
          })
        })
      })
    }
  })
}

/**
  *
  *
**/
IOTA.prototype.getInputs = function(valueToDeduct, inputList, index, callback) {

  var self = this;

  var address = self.addresses[index];

  if (address === undefined) {
    return callback("ERROR: No Balance");
  }


  self.getBalances(address, function(e, success) {

    if (success.balances) {

      for (var i = 0; i < success.balances.length; i++) {

        var thisBalance = success.balances[i];

        // If a balance
        if (thisBalance > 0) {

          var inputEl = {
            'address': address,
            'balance': thisBalance
          }
          inputList.push(inputEl);

          // Return if all balances deducted
          if (thisBalance >= valueToDeduct) {

            return callback(null, inputList)

          } else {

            // If we iterated over all possible inputs, return error
            if (self.addresses.length === (index + 1)) {
              return callback("ERROR");
            }

            valueToDeduct -= thisBalance;
            index += 1;
            self.getInputs(valueToDeduct, inputList, index, callback)
          }
        } else {
          // If no balance, choose the next input

          // If we iterated over all possible inputs, return error
          if (self.addresses.length === (index + 1)) {
            return callback("ERROR");
          }

          index += 1;
          self.getInputs(valueToDeduct, inputList, index, callback)
        }
      }
    } else {

      return callback("ERROR")
    }
  })
}

/**
  *
  *
**/
IOTA.prototype.prepareTransfers = function(seed, securityLevel, transfers, callback) {
  var self = this;
  var bundle = Utils.bundle();

  // Add entries to the bundle
  var totalValue = 0;
  var signatureFragments = [];
  for (var i = 0; i < transfers.length; i++) {
    var timestamp = Math.floor(Date.now() / 1000);

    // TODO: INPUT VALIDATION OF TAG AND MESSAGE
    var signatureMessageLength = 1;

    // If message longer than 2187 trytes, increase signatureMessageLength
    if (transfers[i].message.length > 2187) {
      signatureMessageLength += Math.floor(transfers[i].message.length / 2187);
      console.log("LENGTH: ", signatureMessageLength);
      var msgCopy = transfers[i].message;

      while (msgCopy) {
        console.log(msgCopy.length);
        var fragment = msgCopy.slice(0, 2187);
        msgCopy = msgCopy.slice(2187, msgCopy.length);

        for (var j = 0; fragment.length < 2187; j++) {
          fragment += '9';
        }

        signatureFragments.push(fragment);
      }
    } else {
      var fragment = '';

      if (transfers[i].message) {
        fragment = transfers[i].message.slice(0, 2187)
      }

      for (var j = 0; fragment.length < 2187; j++) {
        fragment += '9';
      }

      signatureFragments.push(fragment);
    }

    var tag = transfers[i].tag ? transfers[i].tag : '999999999999999999999999999';

    Utils.addEntry(bundle, signatureMessageLength, transfers[i].address, transfers[i].value, tag, timestamp)
    totalValue += parseInt(transfers[i].value);
  }

  // Get Inputs
  if (totalValue) {

    self.getInputs(totalValue, [], 0, function(error, inputs) {

      if (!error) {

        for (var i = 0; i < inputs.length; i++) {

          var thisBalance = inputs[i].balance;
          var toSubtract = 0 - thisBalance;
          var emptyTag = '999999999999999999999999999';
          var timestamp = Math.floor(Date.now() / 1000);

          // Add input as bundle entry
          Utils.addEntry(bundle, 2, inputs[i].address, toSubtract, emptyTag, timestamp);

          // Add extra output to send remaining funds to
          if (thisBalance > totalValue) {

            var remainder = thisBalance - totalValue;

            // Generate a new Address
            var key = self._key(Utils.trits(seed), self.addresses.length, 1);
            var digests = self._digests(key);
            var addressTrits = self._address(digests);
            var address = Utils.trits(addressTrits);

            self.addresses.push(address);

            var emptyTag = '999999999999999999999999999';
            var timestamp = Math.floor(Date.now() / 1000);

            Utils.addEntry(bundle, 2, address, remainder, emptyTag, timestamp);
          } else {

            totalValue -= thisBalance;
          }
        }

        Utils.finalize(bundle);
        var finalBundle = self._addTrytes(bundle, signatureFragments);

        for (var i = 0; i < finalBundle.length; i++) {
          if (finalBundle[i].value < 0) {
            var thisAddress = finalBundle[i].address;
            var keyIndex = self.addresses.indexOf(thisAddress);
            var bundleHash = finalBundle[i].bundle;
            var key = self._key(seed, keyIndex, securityLevel);

            var keyFragment = key.slice(securityLevel * 2187, (1 + securityLevel) * 2187);

            finalBundle[i].signatureMessageFragment = Utils.signatureFragment(Utils.normalizedBundle(bundleHash), keyFragment);
          }
        }

        return callback(null, finalBundle);

      } else {

        alert("Not enough balance");
      }
    })
  } else {

    // If no input required, don't sign and simply finish the bundle

    Utils.finalize(bundle);
    var finalBundle = self._addTrytes(bundle, signatureFragments);
    return callback(null, finalBundle);
  }
}

/**
  *
  *
**/
IOTA.prototype.transfer = function(seed, transfers, callback) {

  var self = this;

  self.prepareTransfers(seed, 1, transfers, function(error, trytes) {
    if (error) {
      return callback("ERROR")
    }
    console.log("Prepared Trytes", trytes)
    // Get latest milestone
    self.getMilestone(function(error, milestone) {
      if (error) {
        return callback("ERROR")
      }

      console.log("Got Milestone", milestone.milestone)
      // Get branch and trunk
      self.getTransactionsToApprove(milestone.milestone, function(error, toApprove) {

        if (error) {
          return callback(error)
        }

        console.log("Got transactions to approve", toApprove);
        // attach to tangle - do pow
        self.attachToTangle(toApprove.trunkTransaction, toApprove.branchTransaction, 13, trytes, function(error, attached) {
          if (error) {
            return callback("ERROR")
          }

          console.log("Attached to Tangle. Broadcasting and Storing now");
          // Broadcast and store tx
          self.broadcastAndStore(attached.trytes, function(error, success) {

            if (!error) {
              return callback(null, success);
            }
          })
        })
      })
    })
  })
}

/**
  *
  *
**/
IOTA.prototype.getNewAddress = function(seed, cb) {
  var self = this;

  console.log("getNewAddress: index #", self.addresses.length);

  var key = self._key(Utils.trits(seed), self.addresses.length, 1);
  var digests = self._digests(key);
  var addressTrits = self._address(digests);
  var address = Utils.trytes(addressTrits)

  var findTxs = {
    'command': 'findTransactions',
    'addresses': [address]
  }

  self.sendRequest(findTxs, function(error, success) {

    if (success.hashes.length > 0) {

      // Add to cached address list
      self.addresses.push(address)

      self.getNewAddress(seed, cb)
    } else {

      return cb(null, address);
    }
  })
}

/**
  *
  *
**/
IOTA.prototype.getTransfers = function(seed, callback) {
  var self = this;

  // Populate addresses list with already used addresses
  self.getNewAddress(seed, function(error, success) {

    if (!error) {

      // find all associated transactions with the addresses
      self.findTransactions(self.addresses, function(err, transactions) {

        if (!err) {

          // get inclusion states
          self.getMilestone(function(err, milestone) {
            self.getInclusionStates(milestone.milestone, transactions.hashes, function(err, inclusionStates) {

              if (!err) {

                self.getBundle(transactions.hashes, inclusionStates.states, function(error, tailTransactions, bundles) {



                  // SOME COMPLICATED SHIT HERE
                })
              }
            })
          })
        }
      })
    }
  })
}

/**
  *
  *
**/
IOTA.prototype.sendRequest = function(requestData, callback) {
  var request = new XMLHttpRequest();
  request.open("POST", "http://localhost:14265", true);

  request.onreadystatechange = function() {

    if (this.readyState == 4) {
      var json = JSON.parse(this.responseText);

      if (json.exception) {
        callback(json.exception);
      } else if (json.error) {
        callback(json.error);
      } else {
        callback(null, json);
      }
    }
  };
  request.send(JSON.stringify(requestData));
}
