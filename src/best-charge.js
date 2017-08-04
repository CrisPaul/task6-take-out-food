const loadAllItems = require('./items.js');
const loadAllPromotions = require('./promotions.js');

/*统计商品信息，包括商品id，名称及单价*/
function countItems(inputs,loadAllItems){
    var itemsInfo = loadAllItems();
    var resCollection = [];
    var sym = /\sx\s/g;
    
    inputs.forEach(function(elem){
        let elemId = elem.replace(sym,",").split(',')[0];       //商品id
        let elemNum = elem.replace(sym,',').split(',')[1]?parseInt(elem.replace(sym,',').split(',')[1]):1;    //商品数量
        for(let i=0; i < resCollection.length; i++){
            if(resCollection[i].id == elemId){
                resCollection[i].count += elemNum;
                return ;
            }
        }
        itemsInfo.forEach(function(obj){
            if(obj.id == elemId){
                resCollection.push({
                    id: obj.id,
                    name:   obj.name,
                    unitPrice:  obj.price,
                    count:  elemNum
                    //cost:   obj.price * elemNum
                })
            }
        })
    })
    return resCollection;
}
/*统计所选菜品中优惠菜品信息*/
function countPromotions(items,loadAllPromotions){
    var promotionInfo = loadAllPromotions();
    var resPromotions = [];       
    
    items.forEach(function(elem){
         
         if(promotionInfo[1].items.indexOf(elem.id) >= 0 ){
             resPromotions.push({
                 promotionType:  promotionInfo[1],
                 promotionId:   elem.id,
                 promotionName:  elem.name,
                 promotionSaved:  parseInt(elem.unitPrice/2),
                 promotionNum:  elem.count
             })
         }
         
    })
    return resPromotions;
}
//创建清单的表头
function buildMenuList_Head(items, promotions){
    var listHead = "============= 订餐明细 ============="+'\n';
    items.forEach(function(elem){
        let elemTotal = elem.unitPrice * elem.count;
        listHead += elem.name + " x "+ elem.count + " = "+ elemTotal + "元" + "\n";
    })
    return listHead;
}
//清单优惠菜品信息
function buildMenuList_Promotions(items, promotions){
    var listPromotions = "-----------------------------------" + "\n" ;
    var totalCostHalf= 0,totalCostSub = 0, totalSaved = 0,totalValue = 0;       //totalCostHalf:半价总计实际消费金额，totalCostSub满30减6，t减6otalSaved: 总的节省金额,totalValue: 总计原价
    promotions.forEach(function(elem){
        totalSaved += elem.promotionSaved * elem.promotionNum;
    })
    items.forEach(function(obj){
        totalValue += obj.unitPrice * obj.count;
    })
    if(totalValue >= 30){
        totalCostSub = totalValue - 6;
    }else{
        totalCostSub = totalValue;
    }
    totalCostHalf = totalValue - totalSaved;
    if(totalCostSub < totalCostHalf && totalValue >= 30){
        listPromotions +="使用优惠:" + "\n" + "满30减6元，省6元"+"\n"+ "-----------------------------------" + "\n"
                            + "总计：" + totalCostSub + "元" + "\n";
    }
    if(totalCostSub > totalCostHalf){
        listPromotions +="使用优惠:" + "\n" + "指定菜品半价(" ;
        for(var i=0 ; i < promotions.length; i++){
            listPromotions += promotions[i].promotionName;
            if(i != promotions.length-1){
                listPromotions += '，';
            }
        }
        listPromotions += ")，省" + totalSaved +"元"+ "\n" + "-----------------------------------" + "\n"
                            + "总计：" + totalCostHalf + "元" + "\n";
    }
    if(totalCostSub == totalCostHalf && totalCostSub == totalValue){
        listPromotions += "总计：" + totalValue+ "元" + "\n";
    }
    listPromotions += "===================================" ;
    return listPromotions;
}
function printMenuList(items,promotions){
    var outputs = "";
    var menuList_Head = buildMenuList_Head(items, promotions);
    var menuList_Promotions = buildMenuList_Promotions(items,promotions);
    outputs += menuList_Head + menuList_Promotions;
    return outputs;
}
module.exports = function bestCharge(inputs) {
  var items = countItems(inputs,loadAllItems);
  var promotions = countPromotions(items, loadAllPromotions);
  var outputs = printMenuList(items, promotions);
 
  return outputs;
}
