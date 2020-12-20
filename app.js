/*Budget App Project */

//Budget Controller Module 
var budgetController = (function() {
    
    var Expense = function(id, desp, val) {
        this.id = id;   //id of each object
        this.desp = desp; //description
        this.val = val; //value
        this.percentage = -1;
    };
    
    Expense.prototype.calcPercentage = function(totalInc) {
        
        if(totalInc > 0) {
            this.percentage = Math.round((this.val / totalInc) * 100);
        } else {
            this.percentage = -1;
        } 
    };
    
    Expense.prototype.getPercentage = function() {
        return this.percentage;
    };
    
    var Income = function(id, desp, val) {
        this.id = id;   //id of each object
        this.desp = desp; //description
        this.val = val;  //value
    };
    
    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(current) {
            sum += current.val;
        });
        data.totals[type] = sum;
    };
    
    var data = {
        allItems : {
            exp:  [],
            inc: []
        }, 
        totals: {
            exp: 0,
            inc: 0
        }, 
        budget: 0, 
        percentage: -1
    };
    
    return {
        itemAdd: function(type, description, value) {
            var newItem, ID;
            
            //Create new ID --> ID = lastID +1
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length -1].id + 1;
            
            } else {
                ID = 0;
            }
           
            //Create new item based on 'inc' or 'exp' type
            if(type === 'exp') {
                 newItem = new Expense(ID, description, value);
            } else if (type === 'inc') {
                 newItem = new Income(ID, description, value);
            }
            
            //Push it into data structure
            data.allItems[type].push(newItem);
            
            //Return the new element
            return newItem;
        }, 
        
        delete: function(type, id) {
            var ids, index;
            //Similar to for each but map returns a new array
            ids = data.allItems[type].map(function(current) {
                return current.id;
            });
            
            index = ids.indexOf(id);
            
            //Delete element splice(pos to start, number of elem to delete);
            if (index !== -1 ) {
                data.allItems[type].splice(index, 1);
            }
            
        },
        
        calculateBudget: function() {
            
            //Calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');
            
            //Calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;
            
            //Calculate the percentage of income that we spent
            if(data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
        }, 
        
        calculatePercentages: function() {
            
            /*
            x= 20
            y =10
            z= 40
            income = 100
            x = 20/100 = 20%
            */
            data.allItems.exp.forEach(function(cur) {
               cur.calcPercentage(data.totals.inc); 
            });
        },
        
        getPercentages: function() {
            
            var allPerc = data.allItems.exp.map(function(cur) {
                return cur.getPercentage();
            });
           
            return allPerc;
        },
        
        getBudget: function() {
            
            return {
                budget: data.budget,
                totalInc: data.totals.inc, 
                totalExp: data.totals.exp, 
                per: data.percentage
            };
            
        },
        
        testing: function() {
            console.log(data);
        }
    };
    
    
})();

//UI Controller Module
var UIController = (function() {
    
    var DOMStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value', 
        inputBtn: '.add__btn', 
        incomeContainer: '.income__list', 
        expenseContainer: '.expenses__list', 
        budgetLabel: '.budget__value', 
        incomeLabel: '.budget__income--value', 
        expenseLabel: '.budget__expenses--value', 
        percentageLabel: '.budget__expenses--percentage',
        title: '.budget__title', 
        container: '.container', 
        expensesPerLabel: '.item__percentage', 
        dateLabel: '.budget__title--month'
        
    };
    
    var formatNumber = function(num, type) {
            var numSplit, int, dec;
            // + or - before number 
            //exactly 2 decimal parts
            //comma seperating the thousands
            
            num = Math.abs(num);
            num = num.toFixed(2);//exactlt 2 decimal points after the integer
            numSplit = num.split('.'); //Splits int and decimal parts
            
            int = numSplit[0];
            
            if(int.length > 3) {
                int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
         
            } 
        
            dec = numSplit[1];

            
            return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;  
        };
        
        var nodeListForEach = function(list, callback) {

                    for(var i = 0; i < list.length; i++) {
                        callback(list[i], i);
                    }
                };
    
    return {
        getInput: function() {
            
            return {
                type: document.querySelector(DOMStrings.inputType).value, //Will be either inc or exp
                description: document.querySelector(DOMStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
            };
            
        }, 
        
        addListItem: function(obj, type) {
             var html, newHTML, element;
            //Create html string with placeholder text
            if(type === 'inc') {
                element = DOMStrings.incomeContainer;
                html ='<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
             
            }
             
            else if (type === 'exp') {
                element = DOMStrings.expenseContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
             
            //Replace the placeholder text with some actual data
            newHTML = html.replace('%id%', obj.id);
            newHTML = newHTML.replace('%description%', obj.desp);
            newHTML = newHTML.replace('%value%', formatNumber(obj.val, type));
            //Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHTML);
            
        },
        
        //To clear the input fields after entering it
        clearFields: function() {
            var fields, fieldsArr;
            
            fields = document.querySelectorAll(DOMStrings.inputDescription + ', ' +DOMStrings.inputValue);
            
            fieldsArr = Array.prototype.slice.call(fields);
            
            fieldsArr.forEach(function(curr, index, arr) {
                
                curr.value = "";
                
            });
            
            fieldsArr[0].focus();
            
        },
        displayBudget: function(obj) {
            
//            if( obj.budget > 0 ) {
//                document.querySelector(DOMStrings.budgetLabel).textContent ='+' + obj.budget;
//            } else if (obj.budget < 0) {
//                document.querySelector(DOMStrings.budgetLabel).textContent = '-' + obj.budget;
//            }
//            else {
//                document.querySelector(DOMStrings.budgetLabel).textContent = '0';
//            }
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type);  
            
            document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMStrings.expenseLabel).textContent = formatNumber(obj.totalExp, 'exp'); 
           
           if(obj.per > 0) {
              document.querySelector(DOMStrings.percentageLabel).textContent = obj.per + '%';
           } else {
               document.querySelector(DOMStrings.percentageLabel).textContent = '--'
               ;
           }
            
        },
        
        displayPercentage: function(percentages) {
            
            var fields;
            fields = document.querySelectorAll(DOMStrings.expensesPerLabel);
            
            
            nodeListForEach(fields, function(current, index){
                
                if(percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                    
                } else {
                    current.textContent = '--';
                }
                
            });
            
        },
        
        displayMonth: function() {
            
            var now, year, month, months;
            now = new Date();
            year = now.getFullYear();
            
            months = ['January', 'Febuary', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = now.getMonth();
            document.querySelector(DOMStrings.dateLabel).textContent = months[month] + ' ' + year;
            
        },
        
        deleteListItem: function(selectorID) {
            var elem = document.getElementById(selectorID);
            elem.parentNode.removeChild(elem);
            
        },
        
        changeType: function() {
            
            var fields;
            fields = document.querySelectorAll(
                DOMStrings.inputType + ','+ 
                DOMStrings.inputDescription + ',' + 
                DOMStrings.inputValue);
            
            nodeListForEach(fields, function(cur) {
                cur.classList.toggle('red-focus');
            });
            
            document.querySelector(DOMStrings.inputBtn).classList.toggle('red');
        },
        
        getDOMStrings: function() {
            return DOMStrings;
        }
    };
    
})();

//App Controller Module
var appController = (function(budgetCtrl, UICtrl) {
     var budget;
     var updateBudget = function() {
         //1. Calculate the budget 
         budgetCtrl.calculateBudget();
         
         //2. Return the budget
         budget = budgetCtrl.getBudget();
         
        //3. Update/ Display the budget 
         UICtrl.displayBudget(budget);
        
         
     };
    
     var updatePercentages = function() {
         var percentages;
         //1. Calculate percentage
         budgetCtrl.calculatePercentages();
         
         //2. Read them from budget controller
         percentages = budgetCtrl.getPercentages();
         
         //3. Update UI
         UICtrl.displayPercentage(percentages);
         
     };
    
     var addItem  = function() {
         
        var input, newItem;
         /*TO DO :
        1. Get the filled input Data 
        */ 
        input = UICtrl.getInput();
        
         if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
                  /*
            2. Add the item to the budget controller */

             newItem = budgetCtrl.itemAdd(input.type, input.description, input.value);
             /*
            3. Add the new item to the UI */
             UICtrl.addListItem(newItem, input.type);

             //4. Clear the fields
             UICtrl.clearFields();

             //5. Calculate and update budget

             updateBudget();
             
             //6. Calculate and update percentages
             updatePercentages();
        } 
        
    }; 
    
    var deleteItem = function(event) {
        var itemID, splitID, type, ID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if (itemID) {
            
            //inc-1
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
            
            //1. Delete item from the data structure
            budgetCtrl.delete(type, ID);
            
            
            //2. Delete the item from the UI
            UICtrl.deleteListItem(itemID);
    
            
            //3. Update and show the new budget
            updateBudget();
            
            //4. Calculate and update percentages
             updatePercentages();
        }
        
    };
    
    
    var setUpEventListeners = function() {
        var DOM = UICtrl.getDOMStrings();
        
        
        document.querySelector(DOM.inputBtn).addEventListener('click', addItem);
       
        
        document.addEventListener('keypress', function(event) {

            if (event.keyCode === 13 || event.which === 13) {

                addItem();

            }
        }); 
        document.querySelector(DOM.container).addEventListener('click', deleteItem);
        
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeType);
        
    };
    
    
    
   
    
    return {
        init: function() {
            console.log('App has started.');
            UICtrl.displayMonth();
            
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0, 
                totalExp: 0, 
                per: -1
            });
            setUpEventListeners();
            
        }
    };
    
   
    
})(budgetController, UIController);


appController.init();


