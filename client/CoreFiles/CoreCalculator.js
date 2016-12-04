function CoreCalculator(ctrl) {
    var self = this;
    self.output;

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

    self.getMachineByCategory = function (category) {
        return ctrl.categories[category].default;
    }

    self.calculateItemFromId = function (itemId, amount) {
        var res = self.findResourceByItemId(itemId);
        var r = self.findRecipeByItemId(itemId);
        if (r == null && res == null) {
            return null;
        }
        var resultAmount;
        var retObj = {};
        var obj;

        if (res !== null) {
            // its a resources
            if(res.result !== undefined){
                res.category = "basic-solid";
            } else if(res.results !== undefined){
                for(var i = 0; i < res.results.length; i++){
                    if(res.results[i].type === "fluid"){
                        res.category = "basic-fluid";
                    } else {
                        res.category = "basic-solid";
                    }
                }
            }
            obj = res;
        } else {
            // its a recipe
            obj = r;
        }

        if (obj.result !== undefined) {
            resultAmount = obj.resultCount != undefined ? obj.resultCount : 1;
        } else if (obj.results !== undefined) {
            for (var i = 0; i < obj.results.length; i++) {
                if (obj.results[i].name == itemId) {
                    if (obj.results[i].amount !== undefined) {
                        resultAmount = obj.results[i].amount;
                    } else if (obj.results[i].amountMin !== undefined) {
                        resultAmount = obj.results[i].amountMin;
                    }
                }
            }

        }
        retObj.machine = self.getMachineByCategory(obj.category);
        retObj.name = obj.name;
        retObj.resultCount = resultAmount * self.calculateProductivityBonus(retObj.machine)
        retObj.crafts = amount / retObj.resultCount;
        retObj.realCraftTime = self.calculateCraftTime(obj, retObj.machine);
        retObj.itemName = itemId;
        retObj.craftsPerSecond = 1/retObj.realCraftTime;
        retObj.outputPerSecond = retObj.craftsPerSecond * retObj.resultCount;
        retObj.machineCount = Math.ceil((amount/ctrl.speed)/retObj.outputPerSecond); 

        retObj.ingredients = [];
        if (obj.ingredients !== undefined) {
            for (var i = 0; i < obj.ingredients.length; i++) {
                retObj.ingredients[i] = self.calculateItemFromId(obj.ingredients[i].name, retObj.crafts * obj.ingredients[i].amount);
            }
        }
        return retObj;
        // machine
        // machineCount
        // item amount
        // craftspeed

    }

    self.calculateCraftTime = function (recipe, machine) {
        if(machine.speed !== undefined && machine.power !== undefined){
            var leftoverpower = machine.power - recipe.hardness;
            var craftSpeed = self.calculateCraftSpeed(machine);
            var result = recipe.miningTime / (leftoverpower*craftSpeed);
            return result;
        }else {
            return recipe.energy / self.calculateCraftSpeed(machine);
        }
    }

    self.calculateProductivityBonus = function (machine) {
        var bonus = 1;
        if (machine.modules != undefined && machine.moduleSlots != undefined) {
            for (var i = 0; i < machine.moduleSlots.length; i++) {
                if (machine.moduleSlots[i].productivity != undefined) {
                    bonus += machine.moduleSlots[i].effects.productivity;
                }
            }

        }
        return bonus;
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

    self.findResourceByItemId = function (id) {
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
        return null;
    }

    self.findRecipeByItemId = function (id) {
        var recipes = ctrl.data.recipes;

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