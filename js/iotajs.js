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
IOTA.prototype.digest = function(normalizedBundleFragment, signatureFragment) {
  var buffer = [], state = [], state2 = [];

  Utils.initialize(state);
  for (var i = 0; i< 27; i++) {
    buffer = signatureFragment.slice(i * 243, (i + 1) * 243);

    for (var j = normalizedBundleFragment[i] + 13; j-- > 0; ) {
      Utils.initialize(state2);
      Utils.absorb(buffer, state2);
      Utils.squeeze(buffer, state2);
    }

    Utils.absorb(buffer, state);
  }

  Utils.squeeze(buffer, state);
  return buffer;
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
IOTA.prototype.getTransactionsToApprove = function(depth, callback) {

  var command = {
    'command'   : 'getTransactionsToApprove',
    'depth' : depth
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

  if (typeof transactions === 'string') transactions = Array(transactions);

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
  var emptySignatureFragment = '';
  for (var j = 0; emptySignatureFragment.length < 2187; j++) {
    emptySignatureFragment += '9';
  }

  for (var i = 0; i < bundle.transactions.length; i++) {

    // Fill empty signatureMessageFragment
    bundle.transactions[i].signatureMessageFragment = signatureFragments[i] ? signatureFragments[i] : emptySignatureFragment;

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

    finalBundle.push(bundle.transactions[i]);
  }

  return finalBundle;
}

IOTA.prototype.attachAndMore = function(trytes, callback) {

  var self = this;

  // Get branch and trunk
  self.getTransactionsToApprove(27, function(error, toApprove) {

    if (error) {
      return callback(error)
    }

    console.log("Got transactions to approve", toApprove);
    // attach to tangle - do pow
    self.attachToTangle(toApprove.trunkTransaction, toApprove.branchTransaction, 13, trytes, function(error, attached) {
      if (error) {
        return callback("ERROR")
      }

      self.analyzeTransactions(attached.trytes, function(e, analyzed) {
        console.log(JSON.stringify(analyzed));
      })

      console.log("Attached to Tangle. Broadcasting and Storing now");
      // Broadcast and store tx
      self.broadcastAndStore(attached.trytes, function(error, success) {

        if (!error) {
          self.analyzeTransactions(attached.trytes, function(error, analyzed) {
            return callback(null, analyzed);
          })
        }
      })
    })
  })
}

/**
  *
  *
**/
IOTA.prototype.replayTransfer = function(bundleHash, callback) {

  var self = this;
  self.getBundle(bundleHash, function(error, bundle) {

    if (error) return callback(error);

    // Get the trytes of all the bundle objects
    var bundleTrytes = [];
    bundle[0].forEach(function(bundleTx) {
      bundleTrytes.push(Utils.transactionTrytes(bundleTx));
    })

    self.attachAndMore(bundleTrytes.reverse(), callback);
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


  self.getBalances(Array(address), function(e, success) {

    if (e) {
      return callback(e);
    }

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

  var totalValue = 0;
  var signatureFragments = [];
  var tag;

  for (var i = 0; i < transfers.length; i++) {
    var timestamp = Math.floor(Date.now() / 1000);

    // TODO: INPUT VALIDATION OF TAG AND MESSAGE
    var signatureMessageLength = 1;

    // If message longer than 2187 trytes, increase signatureMessageLength
    if (transfers[i].message.length > 2187) {
      signatureMessageLength += Math.floor(transfers[i].message.length / 2187);

      var msgCopy = transfers[i].message;

      while (msgCopy) {
        var fragment = msgCopy.slice(0, 2187);
        msgCopy = msgCopy.slice(2187, msgCopy.length);

        // Pad remainder of fragment
        for (var j = 0; fragment.length < 2187; j++) {
          fragment += '9';
        }

        signatureFragments.push(fragment);
      }
    } else {
      // Else, get single fragment with 2187 of 9's trytes
      var fragment = '';

      if (transfers[i].message) {
        fragment = transfers[i].message.slice(0, 2187)
      }

      for (var j = 0; fragment.length < 2187; j++) {
        fragment += '9';
      }

      signatureFragments.push(fragment);
    }

    // If no tag defined, get 27 tryte tag.
    tag = transfers[i].tag ? transfers[i].tag : '999999999999999999999999999';

    // Pad for required 27 tryte length
    for (var j = 0; tag.length < 27; j++) {
      tag += '9';
    }

    // Add first entry to the bundle
    Utils.addEntry(bundle, signatureMessageLength, transfers[i].address, transfers[i].value, tag, timestamp)
    totalValue += parseInt(transfers[i].value);
  }

  // Get inputs if we are sending tokens
  if (totalValue) {

    self.getInputs(totalValue, [], 0, function(error, inputs) {

      if (!error) {

        for (var i = 0; i < inputs.length; i++) {

          var thisBalance = inputs[i].balance;
          var toSubtract = 0 - thisBalance;
          var timestamp = Math.floor(Date.now() / 1000);

          // Add input as bundle entry
          Utils.addEntry(bundle, securityLevel + 1, inputs[i].address, toSubtract, tag, timestamp);

          // Add extra output to send remaining funds to
          if (thisBalance > totalValue) {

            var remainder = thisBalance - totalValue;

            // Generate a new Address
            var key = self._key(Utils.trits(seed), self.addresses.length, 2);
            var digests = self._digests(key);
            var addressTrits = self._address(digests);
            var address = Utils.trytes(addressTrits);

            self.addresses.push(address);

            var timestamp = Math.floor(Date.now() / 1000);

            // Remainder bundle entry
            Utils.addEntry(bundle, 1, address, remainder, tag, timestamp);
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

            var key = self._key(Utils.trits(seed), keyIndex, 2);
            var digests = self._digests(key);
            var addressTrits = self._address(digests);
            var address = Utils.trytes(addressTrits)
            console.log(keyIndex, thisAddress);
            console.log("Address for signing: ", address);

            var firstFragment = key.slice(0,  6561);

            var normalizedBundleHash = Utils.normalizedBundle(bundleHash);
            var firstBundleFragment = normalizedBundleHash.slice(0, 27);

            var firstSignedFragment = Utils.signatureFragment(firstBundleFragment, firstFragment);

            finalBundle[i].signatureMessageFragment = Utils.trytes(firstSignedFragment);

            // Find remainder tx and sign it
            for (var j = 0; j < finalBundle.length; j++) {
              if (finalBundle[j].address === thisAddress && finalBundle[j].value === 0) {
                var secondFragment = key.slice(6561,  2 * 6561);

                var secondBundleFragment = normalizedBundleHash.slice(27, 27 * 2);

                var secondSignedFragment = Utils.signatureFragment(secondBundleFragment, secondFragment);

                finalBundle[j].signatureMessageFragment = Utils.trytes(secondSignedFragment);
              }
            }
          }
        }

        //console.log("566", JSON.stringify(finalBundle));

        var txTrytes = []
        finalBundle.forEach(function(tx) {
          txTrytes.push(Utils.transactionTrytes(tx))
        })

        return callback(null, txTrytes.reverse());

      } else {

        alert("Not enough balance");
      }
    })
  } else {

    // If no input required, don't sign and simply finish the bundle

    Utils.finalize(bundle);
    var finalBundle = self._addTrytes(bundle, signatureFragments);

    var finalBundle = Array(Utils.transactionTrytes(finalBundle[0]));
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
    console.log("Prepared Trytes", JSON.stringify(trytes))

    self.attachAndMore(trytes, callback);
  })
}

/**
  *
  *
**/
IOTA.prototype.getNewAddress = function(seed, cb) {
  var self = this;

  console.log("getNewAddress: index #", self.addresses.length);

  var key = self._key(Utils.trits(seed), self.addresses.length, 2);
  var digests = self._digests(key);
  var addressTrits = self._address(digests);
  var address = Utils.trytes(addressTrits)

  var findTxs = {
    'command': 'findTransactions',
    'addresses': [address]
  }

  self.sendRequest(findTxs, function(error, success) {
    console.log(error, success)
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
  *   @method traverseBundle
  *   @param {string} trunkTx Hash of a trunk or a tail transaction  of a bundle
  *   @param {string} bundleHash
  *   @param {list} bundle List of bundle objects to be populated
  *   @returns {list} bundle Transaction objects
**/
IOTA.prototype.traverseBundle = function(trunkTx, bundleHash, bundle, index, directCallback, callback) {

  var self = this;
  // Get trytes of transaction hash
  self.getTrytes(trunkTx, function(error, trytes) {

    if (error) return callback(error);

    // Get transaction object
    self.analyzeTransactions(trytes.trytes, function(error, analyzed) {

      if (error) return callback(error);
      console.log(analyzed);
      console.log(bundleHash, bundle);
      console.log(bundle.length);

      // If not tail, get tail and return bundle
      if (!bundleHash && bundle.length === 0 && analyzed[0].currentIndex !== 0) {
        console.log("HERE NOW", trunkTx, bundleHash);
        return self.tailFromBundle(analyzed[0].bundle, directCallback);
      }

      // If no bundle hash, define it
      if (!bundleHash) {
        bundleHash = analyzed[0].bundle;
      }

      // If different bundle hash, return with bundle
      if (bundleHash !== analyzed[0].bundle) {
        console.log("Returning 787")
        return callback(null, bundle);
      }

      // If only one bundle element, return
      if (analyzed[0].lastIndex === 0 && analyzed[0].currentIndex === 0) {
        return callback(null, analyzed);
      }

      console.log("down here");
      // Define new trunkTransaction for search
      var trunkTx = analyzed[0].trunkTransaction;
      // Add transaction object to bundle
      bundle.push(analyzed[0]);
      // Continue traversing with new trunkTx
      index += 1;
      return self.traverseBundle(trunkTx, bundleHash, bundle, index, directCallback, callback);
    })
  })
}

/**
  *
  *
**/
IOTA.prototype.validateSignatures = function(expectedAddress, signatureFragments, bundleHash) {

  var self = this;

  var normalizedBundleFragments = [];
  var normalizedBundleHash = Utils.normalizedBundle(bundleHash);

  // Split hash into 3 fragments
  for (var i = 0; i < 3; i++) {
    normalizedBundleFragments[i] = normalizedBundleHash.slice(i * 27, (i + 1) * 27);
  }

  // Get digests
  var digests = [];
  for (var i = 0; i < signatureFragments.length; i++) {
    var digestBuffer = self.digest(normalizedBundleFragments[i % 3], Utils.trits(signatureFragments[i]));

    for (var j = 0; j < 243; j++) {
      digests[i * 243 + j] = digestBuffer[j]
    }
  }

  var address = Utils.trytes(self._address(digests));

  return (expectedAddress === address);
}

/**
  *
  *
**/
IOTA.prototype.tailFromBundle = function(bundleHash, callback) {

  var self = this;
  console.log("getting tail from bundle", bundleHash);
  // Search transactions with the same bundle hash
  var findTransactions = {
    'command': 'findTransactions',
    'bundles': [bundleHash]
  }

  self.sendRequest(findTransactions, function(e, transactions) {

    // Get trytes of transaction hash
    self.getTrytes(transactions.hashes, function(error, trytes) {

      if (error) return callback(error);

      // Get transaction object
      self.analyzeTransactions(trytes.trytes, function(error, analyzed) {

        var tailTransactions = [];

        analyzed.forEach(function(tx) {
          if (tx.currentIndex === 0) {
            tailTransactions.push(tx.hash);
          }
        })

        console.log(tailTransactions);

        // If multiple tail transactions, get the valid one
        if (tailTransactions.length > 1) {
          async.mapSeries(tailTransactions, function(txHash, cb) {
            self.getBundle(txHash, function(e, bundle) {
              console.log(e, bundle);
              if (bundle) {
                console.log("returning")
                cb(null, bundle);
              }
            })
          }, function(e, results) {
            if (results) {
              var finalBundle = [];
              results.forEach(function(el) {
                finalBundle.push(el[0]);
              })
              return callback(null, finalBundle);
            }
          })
        } else {
          // If only one tail transaction, return it
          console.log("Single tail");
          return self.getBundle(tailTransactions[0], callback)
        }
      })
    })
  })
}

/**
  * Gets the associated bundle transactions of a single transaction
  * Does validation of signatures, total sum as well as order

  *   @method getBundle
  *   @param {string} transaction Hash of a tail transaction
  *   @returns {list} bundle Transaction objects
**/
IOTA.prototype.getBundle = function(transaction, callback) {

  var self = this;
  console.log("Tx:", transaction)
  self.traverseBundle(transaction, null, Array(), 0, callback, function(error, bundle) {

    if (error) return callback(error);

    /**
          Validity Check Functions
    **/

    var totalSum = 0, lastIndex, bundleHash;

    // Prepare to absorb txs and get bundleHash
    var bundleFromTxs = [], state = [];
    Utils.initialize(state);

    // Prepare for signature validation
    var signaturesToValidate = [];

    bundle.forEach(function(bundleTx, index) {
      totalSum += bundleTx.value;

      if (!lastIndex) {
        lastIndex = bundleTx.lastIndex;
        bundleHash = bundleTx.bundle;
      } else {

        // Check if (lastIndex + 1) is the same as the total sum of txs in the bundle
        if (bundleTx.lastIndex !== lastIndex) {
          return callback(new Error("Invalid Bundle Length"));
        }
      }
      console.log(bundleTx);
      var thisTxTrytes = Utils.transactionTrytes(bundleTx);
      // Absorb bundle hash + value + timestamp + lastIndex + currentIndex trytes.
      Utils.absorb(Utils.trits(thisTxTrytes.slice(2187, 2187 + 162)), state)

      // Check if input transaction
      if (bundleTx.value < 0) {
        var thisAddress = bundleTx.address;

        var newSignatureToValidate = {
          'address': thisAddress,
          'signatureFragments': Array(bundleTx.signatureMessageFragment)
        }

        for (var i = index; i < bundle.length - 1; i++) {
          var newBundleTx = bundle[i + 1];

          // Check if new tx is part of the signature fragment
          if (newBundleTx.address === thisAddress && newBundleTx.value === 0) {
            newSignatureToValidate.signatureFragments.push(newBundleTx.signatureMessageFragment);
          } else {
            // TODO: BREAK ???
          }
        }

        signaturesToValidate.push(newSignatureToValidate);
      }
    });
    console.log(bundle);
    // Check for total sum, if not equal 0 throw error
    if (totalSum !== 0) return callback(new Error("Invalid Bundle Sum"));

    Utils.squeeze(bundleFromTxs, state);
    var bundleFromTxs = Utils.trytes(bundleFromTxs);

    // Check if bundle hash is the same as returned by tx object
    if (bundleFromTxs !== bundleHash) return callback(new Error("Invalid Bundle Hash"));



    // TODO Last tx should have lastIndex = currentIndex
    if (bundle[bundle.length - 1].currentIndex !== bundle[bundle.length - 1].lastIndex) return callback(new Error("Invalid Bundle"));

    if (bundle[bundle.length - 1].lastIndex !== bundle.length - 1) return callback(new Error("Invalid Bundle Sum of Elements"));


    // Validate the signatures
    for (var i = 0; i < signaturesToValidate.length; i++) {
      var isValidSignature = self.validateSignatures(signaturesToValidate[i].address, signaturesToValidate[i].signatureFragments, bundleHash);

      if (!isValidSignature) return callback("Invalid Signatures!");
    }
    console.log(bundle);
    return callback(null, Array(bundle));
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
          console.log(transactions.hashes);
          // Get latest milestone
          self.getNodeInfo(function(error, nodeInfo) {
            // get inclusion states
            self.getInclusionStates(nodeInfo.latestSolidSubtangleMilestone, transactions.hashes, function(err, inclusionStates) {
              if (!err) {
                // For each transaction do getBundle
                // Then associate inclusion states with the entire bundle
                var hashesAlreadyFound = [];
                var bundlesAlreadyFound = [];
                async.mapSeries(transactions.hashes, function(txHash, cb) {
                  console.log(transactions.hashes, hashesAlreadyFound, txHash, hashesAlreadyFound.indexOf(txHash) );
                  if (hashesAlreadyFound.indexOf(txHash) > -1) return cb(null, undefined);

                  self.getBundle(txHash, function(e, bundle) {
                    console.log(e, bundle);

                    if (bundle) {
                      var uniqueBundles = [];

                      bundle.forEach(function(bundleElement) {
                        var stringifiedBundle = JSON.stringify(bundleElement);

                        if (bundlesAlreadyFound.indexOf(stringifiedBundle) === -1) {
                          bundlesAlreadyFound.push(stringifiedBundle);

                          bundleElement.forEach(function(bundleTx) {
                            hashesAlreadyFound.push(bundleTx.hash);
                          })

                          uniqueBundles.push(bundleElement);
                        } else {
                          console.log("Already found!!!", bundleElement);
                        }
                      })

                      cb(null, uniqueBundles);
                    }


                  })
                }, function(error, results) {

                  results = results.filter(function(n){ return n !== undefined });

                  var transfers = []

                  results.forEach(function(bundleElements) {
                    if (bundleElements === undefined) {
                      return
                    }

                    bundleElements.forEach(function(bundle) {

                      // Search for getInclusionStates transaction
                      // If found, add to all elements in bundle, add to transfers
                      // and break
                      async.someSeries(bundle, function(bundleTx, cb) {
                        var hash = bundleTx.hash;
                        var index = transactions.hashes.indexOf(hash);

                        if (index > -1) {
                          var inclusionState = inclusionStates.states[index];

                          bundle.forEach(function(bundleTx) {
                            bundleTx['persistence'] = inclusionState;
                          })
                          transfers.push(bundle);
                          return cb(true);
                        }

                        cb(false);
                      })
                    })
                  })

                  // credit: http://stackoverflow.com/a/8837505
                  // Sort by timestamp

                  transfers.sort(function(a, b) {
                      var x = parseInt(a[0]['timestamp']); var y = parseInt(b[0]['timestamp']);
                      return ((x < y) ? -1 : ((x > y) ? 1 : 0));
                  });

                  console.log(transfers);

                  return callback(null, transfers);
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
