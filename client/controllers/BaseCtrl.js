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
        console.log(self.categories);
        for(var i = 0; i< self.categories.length; i++){
            
            var machine = self.findBestMachineForCategory(self.categories[i]);
        }
    }

    self.findBestMachineForCategory = function(cat){
        var machine
        for(var i = 0; i < cat.machines.length; i++){
            if(machine === undefined){
                machine = cat.machines[i];
            }else {
                if(cat.machines[i].speed > machine.speed){
                    machine = cat.machines[i];
                }
            }
        }
        return machine;
    }


    self.getDefaultJson();
}