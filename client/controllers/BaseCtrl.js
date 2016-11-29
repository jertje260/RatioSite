function BaseCtrl(app){
    var self = this;
    self.data;
    self.categories = {};

    self.getDefaultJson = function(){
        $.get({
            url:'/calc/vanilla',
            success: function(data){
                console.log(data);
                self.data = data;
                self.loadBuildings();
            },
            error: function(err){
                console.log(err);
                alert(err);
            }
        })
    }

    self.loadBuildings = function(){
        for(var i = 0; i < self.data.assemblingMachines.length; i++){
            var cat = self.data.assemblingMachines[i].categories
            for(var j = 0; j < cat.length; j++){
                if(self.categories[cat[j]] === undefined){
                    self.categories[cat[j]] = {};
                    self.categories[cat[j]].machines = [];
                }
                self.categories[cat[j]].machines.push(self.data.assemblingMachines[i]);
            }
        }
        $("#buildings").empty();
        console.log(self.categories);
        for(var prop in self.categories){
            if(self.categories[prop].machines.length > 1){
                var machine = self.findBestMachineForCategory(prop);
                // add up for selection
                self.addForMachineSelection(prop, machine.name);
                console.log(machine);
            }
        }
    }

    self.findBestMachineForCategory = function(cat){
        var machine;
        for(var i = 0; i < self.categories[cat].machines.length; i++){
            if(machine === undefined){
                machine = self.categories[cat].machines[i];
            }else {
                if(self.categories[cat].machines[i].speed > machine.speed){
                    machine = self.categories[cat].machines[i];
                }
            }
        }
        return machine;
    }

    self.addForMachineSelection = function(cat, defaultMachine){
        $.get("/html/select.html").done(function(data){
            $("#buildings").append(data);
            $("#new").attr("id", cat);
            $("#newLabel").attr("id", cat + "Label");
            $("#" + cat + "Label").html(cat);
            var select = $("#"+cat);  
            select.attr("name", cat);
            var machines = self.categories[cat].machines;   
            for(var i = 0; i < machines.length; i++){
                if(machines[i].name == defaultMachine){
                    $("<option />", {value: machines[i].name, text: machines[i].name, selected: true}).appendTo(select);
                }else {
                    $("<option />", {value: machines[i].name, text: machines[i].name }).appendTo(select);
                }
            }
        });
    }

    self.findItem = function(input){
        input = input.replace(' ', '-');
        var items = [];
        for(var i = 0; i <self.data.recipes.length; i++){
            if(self.data.recipes[i].name.search(input) !== -1){
                items.push(self.data.recipes[i]);
            }
        }
    }

    self.getDefaultJson();
}