function CoreCalculator(){
    var self = this;
    self.output;
    self.machines;
    self.goals;
    self.recipes;
    self.time = 60;

    self.calculateOnSpeed = function(machines, goals, recipes, time){
        if(time !== undefined){
            self.time = time;
        } else {
            self.time = 60;
        }
    
        self.output = {};
        self.machines = machines;
        self.goals = goals;
        self.recipes = recipes;
        for(var i = 0; i < self.goals.length; i++){
            output[self.goals[i].name] = self.calculateItem(self.goals[i]);
        }
        return output;
    }

    self.calculateRatios = function(machines, goals, recipes){
        self.output = {};
        self.machines = machines;
        self.goals = goals;
        self.recipes = recipes;

    }

    self.calculateItem = function(recipe){
        
    }

}