function BaseCtrl(app) {
    var self = this;
    self.data;
    self.categories = {};
    self.goals = [];
    self.calculator = new CoreCalculator(self);
    self.calculated = {};
    self.groupid = 1;

    self.getDefaultJson = function () {
        $.get({
            url: '/calc/vanilla',
            success: function (data) {
                console.log(data);
                self.data = data;
                self.loadSearch();
                self.loadBuildings();
            },
            error: function (err) {
                console.log(err);
                alert(err);
            }
        })
    }

    self.init = function () {
        self.addListeners();
        self.getDefaultJson();
    }

    self.addListeners = function () {
        $("#addRecipe").click(function () {
            var option = $('option[value="' + $("#searchBar").val() + '"]');
            var id = option.attr('id');
            var item = {};
            item.name = id;
            item.amount = 1;
            self.goals.push(item);
            self.addGoalHtml(item);
            $("#searchBar").val("");
        });
        $("#goalList").on('click', '.removeGoal', function () {
            var goalId = $(this).attr('id');
            goalId = goalId.replace('remove', '');
            self.removeGoalById(goalId)

        });
        $("#goalList").on('keyup mouseup', '.amount', function () {
            var goalId = $(this).attr('id');
            var amount = parseInt($(this).val());
            goalId = goalId.replace('Amount', '');
            self.changeAmount(goalId, amount);
        });
        $('#calculations').on('click','.list-group-item', function () {
            $('.glyphicon', this)
                .toggleClass('glyphicon-chevron-right')
                .toggleClass('glyphicon-chevron-down');
        });

    }

    self.loadSearch = function () {
        var list = $("#recipesList");
        for (var i = 0; i < self.data.items.length; i++) {
            var id = self.data.items[i];
            var itemname = self.nameToNiceName(self.data.items[i]);
            list.append("<option value='" + itemname + "' + id='" + id + "' ></option>");
        }
    }

    self.loadBuildings = function () {
        for (var i = 0; i < self.data.assemblingMachines.length; i++) {
            var cat = self.data.assemblingMachines[i].categories
            for (var j = 0; j < cat.length; j++) {
                if (self.categories[cat[j]] === undefined) {
                    self.categories[cat[j]] = {};
                    self.categories[cat[j]].machines = [];
                }
                self.categories[cat[j]].machines.push(self.data.assemblingMachines[i]);
            }
        }
        self.categories[self.data.rocketSilo.categories[0]] = {};
        self.categories[self.data.rocketSilo.categories[0]].machines = [];
        self.categories[self.data.rocketSilo.categories[0]].machines.push(self.data.rocketSilo);

        $("#buildings").empty();
        for (var prop in self.categories) {
            if (self.categories[prop].machines.length > 1) {
                var machine = self.findBestMachineForCategory(prop);
                // add up for selection
                self.addForMachineSelection(prop, machine.name);
            }
        }
    }

    self.findBestMachineForCategory = function (cat) {
        var machine;
        for (var i = 0; i < self.categories[cat].machines.length; i++) {
            if (machine === undefined) {
                machine = self.categories[cat].machines[i];
            } else {
                if (self.categories[cat].machines[i].speed > machine.speed) {
                    machine = self.categories[cat].machines[i];
                }
            }
        }
        return machine;
    }

    self.addForMachineSelection = function (cat, defaultMachine) {
        $.get("/html/select.html").done(function (data) {
            $("#buildings").append(data);
            $("#new").attr("id", cat);
            $("#newLabel").attr("id", cat + "Label");
            $("#" + cat + "Label").html(self.nameToNiceName(cat));
            var select = $("#" + cat);
            select.attr("name", cat);
            var machines = self.categories[cat].machines;
            for (var i = 0; i < machines.length; i++) {
                if (machines[i].name == defaultMachine) {
                    $("<option />", { value: machines[i].name, text: machines[i].name, selected: true }).appendTo(select);
                } else {
                    $("<option />", { value: machines[i].name, text: machines[i].name }).appendTo(select);
                }
            }
        });
    }

    self.addGoalHtml = function (goal) {
        $.get("/html/goal.html").done(function (data) {
            $("#goalList").append(data);
            $("#goal").attr("id", "div" + goal.name);
            $("#newGoal").html(self.nameToNiceName(goal.name));
            $("#newGoal").attr("id", goal.name + "Label");
            $("#newGoalAmount").attr("id", goal.name + "Amount");
            $("#removeGoal").attr("id", "remove" + goal.name);

        });
    }

    self.removeGoalHtml = function (goal) {
        $("#div" + goal.name).slideUp(200, function () {
            $("#div" + goal.name).remove();
        });
    }

    self.removeGoalById = function (goalId) {
        for (var i = 0; i < self.goals.length; i++) {
            if (self.goals[i].name === goalId) {
                self.removeGoalHtml(self.goals[i]);
                self.goals.splice(i, 1);
                break;
            }
        }
    }

    self.nameToNiceName = function (name) {
        var n = name.replace(/-/g, ' ');
        return n;
    }

    self.changeAmount = function (goalId, amount) {
        for (var i = 0; i < self.goals.length; i++) {
            if (self.goals[i].name === goalId) {
                self.goals[i].amount = amount;
                break;
            }
        }
    }

    self.findItemById = function (input) {
        var item
        for (var i = 0; i < self.data.recipes.length; i++) {
            if (self.data.recipes[i].name === input) {
                item = self.data.recipes[i];
                break;
            }
        }
        return item;
    }

    self.calculate = function () {
        self.calculated = {};
        self.calculated = self.calculator.calculateOnSpeed();
        self.showCalculated();
    }


    self.showCalculated = function () {
        self.groupid = 1;
        var htmlData = "<div class='list-group list-group-root well'>";
        $("#calculations").empty();
        for (var c in self.calculated) {
            htmlData += self.calculationsHtml(self.calculated[c] ,1);
        }
        htmlData += "</div>"
        $("#calculations").append(htmlData);
    }

    self.calculationsHtml = function (recipe, level) {
        if(recipe === null){
            return;
        }
        var html = ""; 

        
        if (recipe.ingredients.length > 0) {
            
            var first = true;
            for (var i = 0; i < recipe.ingredients.length; i++) {
                if (recipe.ingredients[i] !== null) {
                    if (first) {
                        first = false;
                        
                        html += "<a href='#item" + self.groupid + "' class='list-group-item' data-toggle='collapse' style='padding-left: " + level*15 + "px'><i class='glyphicon glyphicon-chevron-right'></i>";
                        html += recipe.itemName + " Amount: " + recipe.crafts + "</a>";
                        html += "<div class='list-group collapse' id='item" + self.groupid++ + "'>";
                    }

                    html += self.calculationsHtml(recipe.ingredients[i], level +1);
                }

            }
            if (!first) {
                html += "</div>";
            }
        } else{
            html += "<a class='list-group-item' style='padding-left: " +(14+ level*15) + "px'>" + recipe.itemName + " Amount: " + recipe.crafts + "</a>";
        }
        return html;
    }

    self.init();
}