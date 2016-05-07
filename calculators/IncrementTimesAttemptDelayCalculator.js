'use strict';
module.exports = function IncrementTimesAttemptDelayCalculator(retryDelay, retryIncrement, attempts, retryMaxDelay) {
  /**
   * if retryIncrement is specified the delay will be retryDelay + (retryIncrement*attemptIndex-1)
   * if retryMaxDelay is > 0, the delay between attempts will be capped at retryMaxDelay 
   * @param  {Number} retryMaxDelay
   * @param  {Number} retryIncrement
   * @param  {Number} attempts	the rank of that attempt 
   * @param  {Number} retryMaxDelay
   * @return {Number} the delay  
   */
    var delay = retryDelay + (retryIncrement * (attempts -1 ));
  	if(retryMaxDelay > 0 && delay > retryMaxDelay) {
    	delay = retryMaxDelay;
  	}
  	return delay; 

};