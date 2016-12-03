function CoreCalculator(ctrl) {
    var self = this;
    self.output;
    self.time = 60;

    self.calculateOnSpeed = function () {
        if (ctrl.speed === -1) {
            return;
        }
        self.output = {};
        for (var i = 0; i < ctrl.goals.length; i++) {
            self.output[ctrl.goals[i].name] = self.calculateItemFromId(ctrl.goals[i].name, ctrl.goals[i].amount);
        }
        return self.output;
    }

    self.calculateRatios = function () {
        self.output = {};
    }

    self.getMachineByCategory = function(category){
        console.log(category);
        return ctrl.categories[category].default;
    }

    self.calculateItemFromId = function (itemId, amount) {
        var r = self.findRecipeByItemId(itemId);
        if (r == null) {
            return null;
        }
        var resultAmount;
        var retObj = {};
        if (r.result !== undefined) {
            resultAmount = r.resultCount != undefined ? r.resultCount : 1;
        } else if (r.results !== undefined) {
            for (var i = 0; i < r.results.length; i++) {
                if (r.results[i].name == itemId) {
                    if (r.results[i].amount !== undefined) {
                        resultAmount = r.results[i].amount;
                    } else if (r.results[i].amountMin !== undefined) {
                        resultAmount = r.results[i].amountMin;
                    }
                }
            }

        }
        retObj.machine = self.getMachineByCategory(r.category);
        retObj.crafts = amount / resultAmount * self.calculateProductivityBonus(retObj.machine);
        retObj.realCraftTime = self.calculateCraftTime(r, retObj.machine)
        retObj.name = r.name;
        retObj.itemName = itemId;


        //var craftspeed = self.calculateCraftSpeed()
        retObj.ingredients = [];
        if (r.ingredients !== undefined) {
            for (var i = 0; i < r.ingredients.length; i++) {
                retObj.ingredients[i] = self.calculateItemFromId(r.ingredients[i].name, retObj.crafts * r.ingredients[i].amount);
            }
        }
        return retObj;
        // machine
        // machineCount
        // item amount
        // craftspeed

    }

    self.calculateCraftTime = function (recipe, machine) {
        var returnVal = recipe.energy / self.calculateCraftSpeed(machine);
        return returnVal;
    }

    self.calculateProductivityBonus = function(machine){
        var bonus = 1;
         if (machine.modules != undefined && machine.moduleSlots != undefined) {
            for (var i = 0; i < machine.moduleSlots.length; i++) {
                if (machine.moduleSlots[i].productivity != undefined) {
                    moduleModifier += machine.moduleSlots[i].effects.productivity;
                }
            }
            
        }
    }

    self.calculateCraftSpeed = function (machine) {
        var moduleModifier = 1;
        if (machine.modules != undefined && machine.moduleSlots != undefined) {
            for (var i = 0; i < machine.moduleSlots.length; i++) {
                if (machine.moduleSlots[i].speed != undefined) {
                    moduleModifier += machine.moduleSlots[i].effects.speed;
                }
            }

        }
        return machine.speed * moduleModifier;

    }

    self.findRecipeByItemId = function (id) {
        var recipes = ctrl.data.recipes;
        var resources = ctrl.data.resources;

        for (var i = 0; i < resources.length; i++) {
            if (resources[i].result === id) {
                return resources[i];
            } else if (resources[i].results !== undefined) {
                for (var j = 0; j < resources[i].results.length; j++) {
                    if (resources[i].results[j].name === id) {
                        return resources[i];
                    }
                }
            }
        }

        for (var i = 0; i < recipes.length; i++) {
            if (recipes[i].result === id) {
                return recipes[i];
            } else if (recipes[i].results !== undefined) {
                for (var j = 0; j < recipes[i].results.length; j++) {
                    if (recipes[i].results[j].name == id) {
                        return recipes[i];
                    }
                }
            }
        }
        return null;
    }

    self.findRecipesByItemId = function (id) {
        var recipes = ctrl.data.recipes;
        var rs = [];

        var resources = ctrl.data.resources;

        for (var i = 0; i < resources.length; i++) {
            if (resources[i].result === id) {
                rs.push(resources[i]);
            } else if (resources[i].results !== undefined) {
                for (var j = 0; j < resources[i].results.length; j++) {
                    if (resources[i].results[j].name == id) {
                        rs.push(resources[i]);
                    }
                }
            }
        }

        for (var i = 0; i < recipes.length; i++) {
            if (recipes[i].result === id) {
                rs.push(recipes[i]);
            } else if (recipes[i].results !== undefined) {
                for (var j = 0; j < recipes[i].results.length; j++) {
                    if (recipes[i].results[j].name == id) {
                        rs.push(recipes[i]);
                    }
                }
            }
        }
        return rs;
    }

    self.findRecipeById = function (id) {
        var recipes = ctrl.data.recipes;
        for (var i = 0; i < recipes.length; i++) {
            if (recipes[i].name === id) {
                return recipes[i];
            }
        }
        return null;
    }



}