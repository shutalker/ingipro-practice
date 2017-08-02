function isSame(arr1, arr2) {
    return arr1.length === arr2.length && arr1.every((val, i) => val === arr2[i]);
}

class Polyline{
    constructor(polyline) {
        this.polyline = polyline; //[]
    }

    changeIfTheSame(line) {
        if (isSame(line.slice(0, this.polyline.length), this.polyline)) {
            this.polyline = line;
            return true;
        }
        return false;
    }
}

class Model{
    constructor(model) {
        this.model = model; //file
    }

    zoom(scale) {
        this.scale = scale;
    }

    rotate(angle) {
        this.angle = angle;
    }

    move(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}

module.exports.Window = class {
    constructor(coordinates) {
        this.coordinates = coordinates; // [[]]
        this.marks = []; //[Polyline]
    }

    loadModel(model) {
        this.model = new Model(model);
    }

    createMark(line) { //line =[]
        for (const polyline of this.marks) {
            if (polyline.changeIfTheSame(line)) {
                return;
            }
        }
        this.marks.push(new Polyline(line));
    }

    delMarks(){
        this.marks = [];
    }
};
