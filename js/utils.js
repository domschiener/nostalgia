var Utils = (function(Utils, undefined) {
  var trytesAlphabet = "9ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  var trytesTrits = [[0, 0, 0], [1, 0, 0], [-1, 1, 0], [0, 1, 0], [1, 1, 0], [-1, -1, 1], [0, -1, 1], [1, -1, 1], [-1, 0, 1], [0, 0, 1], [1, 0, 1], [-1, 1, 1], [0, 1, 1], [1, 1, 1], [-1, -1, -1], [0, -1, -1], [1, -1, -1], [-1, 0, -1], [0, 0, -1], [1, 0, -1], [-1, 1, -1], [0, 1, -1], [1, 1, -1], [-1, -1, 0], [0, -1, 0], [1, -1, 0], [-1, 0, 0]];

  /**
    *
    *
  **/
  Utils.initialize = function(state) {
      for (var i = 0; i < 729; i++) {
          state[i] = 0;
      }
  }

  /**
    *
    *
  **/
  Utils.absorb = function(data, state) {
      for (var i = 0; i < data.length; ) {
          var j = 0;
          while (i < data.length && j < 243) {
              state[j++] = data[i++];
          }
          Utils.transform(state);
      }
  }

  /**
    *
    *
  **/
  Utils.squeeze = function(data, state) {
      for (var i = 0; i < 243; i++) {
          data[i] = state[i];
      }
      Utils.transform(state);
  }

  /**
    *
    *
  **/
  Utils.transform = function(state) {
      var curlF = [1, 0, -1, 1, -1, 0, -1, 1, 0];
      var stateCopy = [], index = 0;

      for (var round = 0; round < 27; round++) {
          stateCopy = state.slice();
          for (var i = 0; i < 729; i++) {
              state[i] = curlF[stateCopy[index] + stateCopy[index += (index < 365 ? 364 : -365)] * 3 + 4];
          }
      }
  }


  /**
    *
    *
  **/
  Utils.signatureFragment = function(normalizedBundleFragment, keyFragment) {
      var signatureFragment = keyFragment.slice(), state = [], hash = [];
      for (var i = 0; i < 27; i++) {
          hash = signatureFragment.slice(i * 243, (i + 1) * 243);
          for (var j = 0; j < 13 - normalizedBundleFragment[i]; j++) {
              Utils.initialize(state);
              Utils.absorb(hash, state);
              Utils.squeeze(hash, state);
          }
          for (var j = 0; j < 243; j++) {
              signatureFragment[i * 243 + j] = hash[j];
          }
      }
      return signatureFragment;
  }

  /**
    *
    *
  **/
  Utils.trits = function(input) {

      var trits = [];
      if (Number.isInteger(input)) {
          var absoluteValue = input < 0 ? -input : input;
          while (absoluteValue > 0) {
              var remainder = absoluteValue % 3;
              absoluteValue = Math.floor(absoluteValue / 3);
              if (remainder > 1) {
                  remainder = -1;
                  absoluteValue++;
              }
              trits[trits.length] = remainder;
          }
          if (input < 0) {
              for (var i = 0; i < trits.length; i++) {
                  trits[i] = -trits[i];
              }
          }
      } else {
          for (var i = 0; i < input.length; i++) {
              var index = trytesAlphabet.indexOf(input.charAt(i));
              trits[i * 3] = trytesTrits[index][0];
              trits[i * 3 + 1] = trytesTrits[index][1];
              trits[i * 3 + 2] = trytesTrits[index][2];
          }
      }
      return trits;
  }

  Utils.trytes = function(trits) {
      var trytes = "";
      for (var i = 0; i < trits.length; i += 3) {
          for (var j = 0; j < trytesAlphabet.length; j++) {
              if (trytesTrits[j][0] == trits[i] && trytesTrits[j][1] == trits[i + 1] && trytesTrits[j][2] == trits[i + 2]) {
                  trytes += trytesAlphabet.charAt(j);
                  break;
              }
          }
      }
      return trytes;
  }

  Utils.value = function(trits) {
      var value = 0;
      for (var i = trits.length; i-- > 0; ) {
          value = value * 3 + trits[i];
      }
      return value;
  }

  Utils.transactionObject = function(transactionTrytes) {
      for (var i = 2279; i < 2295; i++) {
          if (transactionTrytes.charAt(i) != "9") {
              return null;
          }
      }
      var transactionObject = new Object(), transactionTrits = Utils.trits(transactionTrytes), state = [], hash = [];
      Utils.initialize(state);
      Utils.absorb(transactionTrits, state);
      Utils.squeeze(hash, state);
      transactionObject.hash = Utils.trytes(hash);
      transactionObject.signatureMessageFragment = transactionTrytes.slice(0, 2187);
      transactionObject.address = transactionTrytes.slice(2187, 2268);
      transactionObject.value = Utils.value(transactionTrits.slice(6804, 6837));
      transactionObject.tag = transactionTrytes.slice(2295, 2322);
      transactionObject.timestamp = Utils.value(transactionTrits.slice(6966, 6993));
      transactionObject.currentIndex = Utils.value(transactionTrits.slice(6993, 7020));
      transactionObject.lastIndex = Utils.value(transactionTrits.slice(7020, 7047));
      transactionObject.bundle = transactionTrytes.slice(2349, 2430);
      transactionObject.trunkTransaction = transactionTrytes.slice(2430, 2511);
      transactionObject.branchTransaction = transactionTrytes.slice(2511, 2592);
      transactionObject.nonce = transactionTrytes.slice(2592, 2673);
      return transactionObject;
  }

  Utils.transactionTrytes = function(transactionObject) {
      var valueTrits = Utils.trits(transactionObject.value);
      while (valueTrits.length < 81) {
          valueTrits[valueTrits.length] = 0;
      }
      var timestampTrits = Utils.trits(transactionObject.timestamp);
      while (timestampTrits.length < 27) {
          timestampTrits[timestampTrits.length] = 0;
      }
      var currentIndexTrits = Utils.trits(transactionObject.currentIndex);
      while (currentIndexTrits.length < 27) {
          currentIndexTrits[currentIndexTrits.length] = 0;
      }
      var lastIndexTrits = Utils.trits(transactionObject.lastIndex);
      while (lastIndexTrits.length < 27) {
          lastIndexTrits[lastIndexTrits.length] = 0;
      }
      return transactionObject.signatureMessageFragment
              + transactionObject.address
              + Utils.trytes(valueTrits)
              + transactionObject.tag
              + Utils.trytes(timestampTrits)
              + Utils.trytes(currentIndexTrits)
              + Utils.trytes(lastIndexTrits)
              + transactionObject.bundle
              + transactionObject.trunkTransaction
              + transactionObject.branchTransaction
              + transactionObject.nonce;
  }

  /**
    *
    *
  **/
  Utils.bundle = function() {
      var bundle = new Object();
      bundle.transactions = [];
      return bundle;
  }

  /**
    *
    *
  **/
  Utils.addEntry = function(bundle, signatureMessageLength, address, value, tag, timestamp) {
      for (var i = 0; i < signatureMessageLength; i++) {
          var transactionObject = new Object();
          transactionObject.address = address;
          transactionObject.value = i == 0 ? value : 0;
          transactionObject.tag = tag;
          transactionObject.timestamp = timestamp;
          bundle.transactions[bundle.transactions.length] = transactionObject;
      }
  }

  /**
    *
    *
  **/
  Utils.finalize = function(bundle) {
      var state = [];
      Utils.initialize(state);
      for (var i = 0; i < bundle.transactions.length; i++) {
          var valueTrits = Utils.trits(bundle.transactions[i].value);
          while (valueTrits.length < 81) {
              valueTrits[valueTrits.length] = 0;
          }
          var timestampTrits = Utils.trits(bundle.transactions[i].timestamp);
          while (timestampTrits.length < 27) {
              timestampTrits[timestampTrits.length] = 0;
          }
          var currentIndexTrits = Utils.trits(bundle.transactions[i].currentIndex = i);
          while (currentIndexTrits.length < 27) {
              currentIndexTrits[currentIndexTrits.length] = 0;
          }
          var lastIndexTrits = Utils.trits(bundle.transactions[i].lastIndex = bundle.transactions.length - 1);
          while (lastIndexTrits.length < 27) {
              lastIndexTrits[lastIndexTrits.length] = 0;
          }
          Utils.absorb(Utils.trits(bundle.transactions[i].address + Utils.trytes(valueTrits) + bundle.transactions[i].tag + Utils.trytes(timestampTrits) + Utils.trytes(currentIndexTrits) + Utils.trytes(lastIndexTrits)), state);
      }
      var hash = [];
      Utils.squeeze(hash, state);
      hash = Utils.trytes(hash);
      for (var i = 0; i < bundle.transactions.length; i++) {
          bundle.transactions[i].bundle = hash;
      }
  }

  /**
    *
    *
  **/

  // Utils.normalizedBundle = function(bundle) {
  //     var normalizedBundle = [];
  //     for (var i = 0; i < 3; i++) {
  //         var sum = 0;
  //         for (var j = 0; j < 27; j++) {
  //             sum += (normalizedBundle[i * 27 + j] = Utils.value(Utils.trits(bundle.charAt(i * 27 + j))));
  //         }
  //         if (sum >= 0) {
  //             while (sum-- > 0) {
  //                 for (var j = 0; j < 27; j++) {
  //                     if (++normalizedBundle[i * 27 + j] > 13) {
  //                         normalizedBundle[i * 27 + j] = -13;
  //                     } else {
  //                         break;
  //                     }
  //                 }
  //             }
  //         } else {
  //             while (sum++ < 0) {
  //                 for (var j = 0; j < 27; j++) {
  //                     if (--normalizedBundle[i * 27 + j] < -13) {
  //                         normalizedBundle[i * 27 + j] = 13;
  //                     } else {
  //                         break;
  //                     }
  //                 }
  //             }
  //         }
  //     }
  //     return normalizedBundle;
  // }

  Utils.normalizedBundle = function(bundle) {
        var normalizedBundle = [];
        for (var i = 0; i < 3; i++) {
            var sum = 0;
            for (var j = 0; j < 27; j++) {
                sum += (normalizedBundle[i * 27 + j] = Utils.value(Utils.trits(bundle.charAt(i * 27 + j))));
            }
            if (sum >= 0) {
                while (sum-- > 0) {
                    for (var j = 0; j < 27; j++) {
                        if (normalizedBundle[i * 27 + j] > -13) {
                            normalizedBundle[i * 27 + j]--;
                            break;
                        }
                    }
                }
            } else {
                while (sum++ < 0) {
                    for (var j = 0; j < 27; j++) {
                        if (normalizedBundle[i * 27 + j] < 13) {
                            normalizedBundle[i * 27 + j]++;
                            break;
                        }
                    }
                }
            }
        }
        return normalizedBundle;
    }

  return Utils
}(Utils || {}));
