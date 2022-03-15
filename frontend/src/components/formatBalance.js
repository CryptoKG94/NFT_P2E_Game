import BigNumber from "bignumber.js";

export const formatNumber = (num, decimalPlace) => {
  if (num % 1 != 0) return num.toFixed(decimalPlace);
  return num;
};

export const getBalanceNumber = (balance, decimals = 18) => {
  const displayBalance = new BigNumber(balance).dividedBy(
    new BigNumber(10).pow(decimals)
  );

  var num = displayBalance.toNumber();
  return formatNumber(num, 3);
};

export const getFullDisplayBalance = (balance, decimals = 18) => {
  return balance.dividedBy(new BigNumber(10).pow(decimals)).toFixed();
};
