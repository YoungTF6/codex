function numToChi(num) {
  if (isNaN(num) || num > 9999999999999999) {
    return '数字超出范围';
  }
  
  // 数字对应的中文
  const chineseNumbers = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
  // 单位
  const units = ['', '十', '百', '千'];
  const bigUnits = ['', '万', '亿', '兆'];
  
  // 处理负数
  let sign = '';
  if (num < 0) {
    sign = '负';
    num = -num;
  }
  
  // 处理小数
  let decimalPart = '';
  const numStr = num.toString();
  if (numStr.includes('.')) {
    const parts = numStr.split('.');
    num = parseInt(parts[0], 10);
    decimalPart = parts[1];
  }
  
  if (num === 0) {
    return '零' + (decimalPart ? '点' + convertDecimal(decimalPart, chineseNumbers) : '');
  }
  
  let result = '';
  let unitPos = 0;
  let needZero = false;
  
  while (num > 0) {
    const section = num % 10000;
    if (needZero) {
      result = chineseNumbers[0] + result;
    }
    result = convertSection(section, chineseNumbers, units) + bigUnits[unitPos] + result;
    needZero = section < 1000 && section > 0;
    num = Math.floor(num / 10000);
    unitPos++;
  }
  
  // 处理"一十"开头的情况，通常简化为"十"
  if (result.startsWith('一十')) {
    result = result.substring(1);
  }
  
  // 添加小数部分
  if (decimalPart) {
    result += '点' + convertDecimal(decimalPart, chineseNumbers);
  }
  
  return sign + result;
  
  // 转换每4位数字
  function convertSection(section, numbers, units) {
    let str = '';
    let unit = 0;
    let zero = false;
    
    while (section > 0) {
      const digit = section % 10;
      if (digit === 0) {
        if (!zero) {
          zero = true;
        }
      } else {
        if (zero) {
          str = numbers[0] + str;
          zero = false;
        }
        str = numbers[digit] + units[unit] + str;
      }
      section = Math.floor(section / 10);
      unit++;
    }
    
    return str;
  }
  
  // 转换小数部分
  function convertDecimal(decimalStr, numbers) {
    let result = '';
    for (let i = 0; i < decimalStr.length; i++) {
      const digit = parseInt(decimalStr[i], 10);
      result += numbers[digit];
    }
    return result;
  }
}