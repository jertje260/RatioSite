function BaseCtrl(app) {
    var self = this;
    self.data;
    self.categories = {};
    self.goals = [];
    self.calculator = new CoreCalculator(self);
    self.calculated = {};
    self.groupid = 1;
    self.defaultMachines = [];
    self.speed = 60;
    self.files;
    self.totals = [];

    self.getDefaultJson = function () {
        $.get({
            url: '/calc/vanilla',
            success: function (data) {
                self.data = data;
                self.findReverseRecipes();
                self.loadSearch();
                self.loadBuildings();
                console.log(self.data);
            },
            error: function (err) {
                console.log(err);
                alert("Something went wrong. Please report this to DutchJer. With your logfile");
            }
        })
    }

    self.getJson = function (event) {
        event.stopPropagation();
        event.preventDefault();
        $("#uploadForm").ajaxSubmit({
            success: function (data) {
                if (JSON.stringify(data) !== "{}") {
                    console.log(data);
                    self.data = data;
                    self.findReverseRecipes();
                    self.loadSearch();
                    self.loadBuildings();
                }
            },
            error: function (err) {
                console.log(err);
                alert("Something went wrong. Please report this to DutchJer. With your logfile");
            }
        })

        // var fileData = $("#file").prop('files')[0];
        // var data = new FormData();
        // data.append('file', fileData);
        // $.ajax({
        //     url: '/calc/data',
        //     type: 'POST',
        //     data: data,
        //     dataType: 'JSON',
        //     // enctype: 'multipart/form-data',

        // })
    }

    self.init = function () {
        self.addListeners();
        self.getDefaultJson();
    }

    self.findReverseRecipes = function () {
        for (var i = 0; i < self.data.recipes.length; i++) {
            if (self.data.recipes[i].isCircular === undefined) {
                for (var j = 0; j < self.data.recipes.length; j++) {
                    if (i !== j) {
                        if (self.data.recipes[i].name.startsWith("fill") && self.data.recipes[j].name.startsWith("empty")) {
                            console.log(JSON.stringify(self.data.recipes[i].results));
                            console.log(JSON.stringify(self.data.recipes[j].ingredients));
                            console.log(JSON.stringify(self.data.recipes[j].results));
                            console.log(JSON.stringify(self.data.recipes[i].ingredients));
                        }
                        if (((self.data.recipes[i].results !== undefined && self.data.recipes[j].results !== undefined) || (self.data.recipes[i].ingredients.length === 1 && self.data.recipes[j].result !== undefined))) {
                            if (JSON.stringify(self.data.recipes[i].ingredients) === JSON.stringify(self.data.recipes[j].results) && JSON.stringify(self.data.recipes[j].ingredients) === JSON.stringify(self.data.recipes[i].results)) {
                                self.data.recipes[i].isCircular = true;
                                self.data.recipes[j].isCircular = true;
                            }
                        }
                    }
                }
            }
        }
    }


    self.getTotalCountAllForRecipes = function () {
        self.totals = [];
        if (self.calculated !== undefined) {
            for (var prop in self.calculated) {
                self.getTotalCountForRecipe(self.calculated[prop]);
            }
        }
        console.log(self.totals);
    }

    self.getTotalCountForRecipe = function (recipe) {
        if (recipe !== null && recipe !== undefined) {
            if (!self.totals.hasOwnProperty(recipe.itemName)) {
                self.totals[recipe.itemName] = recipe;
            } else {
                self.totals[recipe.itemName].amount += recipe.amount;
                self.totals[recipe.itemName].crafts += recipe.crafts;
                self.totals[recipe.itemName].machineCount += recipe.machineCount;
                self.totals[recipe.itemName].amountPerSecond = self.totals[recipe.itemName].amount / self.speed;
            }
            if (recipe.ingredients !== null && recipe.ingredients !== undefined) {
                for (var i = 0; i < recipe.ingredients.length; i++) {
                    self.getTotalCountForRecipe(recipe.ingredients[i]);
                }
            }
        }

    }

    self.getCircularRecipes = function () {
        var res = [];
        for (var i = 0; i < self.data.recipes.length; i++) {
            if (self.data.recipes[i].isCircular !== undefined && self.data.recipes[i].isCircular) {
                res.push(self.data.recipes[i]);
            }
        }
        return res;
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
        $('#calculations').on('click', '.list-group-item', function () {
            $('.glyphicon', this)
                .toggleClass('glyphicon-chevron-right')
                .toggleClass('glyphicon-chevron-down');
        });
        $('#speed').on('change', function () {
            console.log($('#speed').val());
            var type = $('#speed').val();
            if (type === "ratios") {
                self.speed = -1;
            } else if (type === "per minute") {
                self.speed = 60;
            } else if (type === "per second") {
                self.speed = 1;
            }
        });
        $("#buildings").on('change', '.machines', function () {
            console.log($(this).val());
            var obj = $(this);
            self.changeDefaultMachineForCategory(obj.attr('id'), obj.val());
        });
        $("#calculateEverything").on('click', function () {
            self.calculate();
        });
        $('input[type=file]').on('change', function (event) {
            self.files = event.target.files;
        })
        $("#newModSet").on('submit', function (event) {
            self.getJson(event);
            return false;
        });
    }

    self.changeDefaultMachineForCategory = function (cat, machineName) {
        var machine;
        for (var i = 0; i < self.categories[cat].machines.length; i++) {
            if (self.categories[cat].machines[i].name === machineName) {
                machine = self.categories[cat].machines[i];
                break;
            }
        }
        self.categories[cat].default = machine;
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
            var cat = self.data.assemblingMachines[i].categories;
            for (var j = 0; j < cat.length; j++) {
                if (self.categories[cat[j]] === undefined) {
                    self.categories[cat[j]] = {};
                    self.categories[cat[j]].machines = [];
                }
                self.categories[cat[j]].machines.push(self.data.assemblingMachines[i]);
            }
        }
        for (var i = 0; i < self.data.miningDrills.length; i++) {
            var cat = self.data.miningDrills[i].categories;
            for (var j = 0; j < cat.length; j++) {
                if (self.categories[cat[j]] === undefined) {
                    self.categories[cat[j]] = {};
                    self.categories[cat[j]].machines = [];
                }
                self.categories[cat[j]].machines.push(self.data.miningDrills[i]);
            }
        }
        self.data.rocketSilo.name = "rocket-silo";
        self.categories[self.data.rocketSilo.categories[0]] = {};
        self.categories[self.data.rocketSilo.categories[0]].machines = [];
        self.categories[self.data.rocketSilo.categories[0]].machines.push(self.data.rocketSilo);

        $("#buildings").empty();
        for (var prop in self.categories) {
            var machine = self.findBestMachineForCategory(prop);
            self.categories[prop].default = machine;
            // add up for selection
            self.addForMachineSelection(prop, machine.name);

        }
    }

    self.getMachineForCategory = function (cat) {

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
            $("#newGoal").html(self.nameToNiceName(goal.name) + " amount:");
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
        try {
            self.calculated = {};
            self.calculated = self.calculator.calculateOnSpeed();
            self.getTotalCountAllForRecipes();
            self.showCalculated();
        } catch (err) {
            console.log(err.message);
            console.log(err.stack)
            alert("something went wrong please inform DutchJer\n" + err.message + "\n" + err.stack);
        }
    }


    self.showCalculated = function () {
        self.groupid = 1;
        var htmlData = "";
        $("#calculations").empty();
        for (var c in self.calculated) {
            htmlData += self.calculationsHtml(self.calculated[c], 1);
        }
        $("#calculations").append(htmlData);
    }

    self.calculationsHtml = function (recipe, level) {
        if (recipe === null) {
            return;
        }
        var html = "";

        if (recipe.ingredients !== undefined) {
            if (recipe.ingredients.length > 0) {

                var first = true;
                for (var i = 0; i < recipe.ingredients.length; i++) {
                    if (recipe.ingredients[i] !== null) {
                        if (first) {
                            first = false;

                            html += "<a href='#item" + self.groupid + "' class='list-group-item' data-toggle='collapse' style='padding-left: " + level * 15 + "px'><i class='glyphicon glyphicon-chevron-right'></i>";
                            html += recipe.itemName + " Amount: " + recipe.crafts + " CraftTime: " + Math.round(100 * recipe.realCraftTime) / 100 + " " + self.nameToNiceName(recipe.machine.name) + " Count: " + recipe.machineCount + " </a>";
                            html += "<div class='list-group collapse' id='item" + self.groupid++ + "'>";
                        }

                        html += self.calculationsHtml(recipe.ingredients[i], level + 1);
                    }

                }
                if (!first) {
                    html += "</div>";
                }
            } else {
                html += "<a class='list-group-item' style='padding-left: " + (14 + level * 15) + "px'>" + recipe.itemName + " Amount: " + recipe.crafts + " CraftTime: " + Math.round(100 * recipe.realCraftTime) / 100 + " " + self.nameToNiceName(recipe.machine.name) + " Count: " + recipe.machineCount + "</a>";
            }
        } else {
            html += "<a class='list-group-item' style='padding-left: " + (14 + level * 15) + "px'>" + recipe.itemName + " Amount: " + recipe.amount + "</a>";
        }
        return html;
    }

    self.init();
}