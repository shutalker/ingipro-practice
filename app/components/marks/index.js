import * as d3 from 'd3';
import mediator from '../mediator';
import './style.css';

class Marks {
    constructor(user, parent) {
        document.addEventListener("keydown", this._onDownShiftPlusCtrl.bind(this), false);
        document.addEventListener("keyup", this._onUpShiftPlusCtrl.bind(this), false);

        // this.id = parent.globalId;
        this._user = user;
        this._flag = false;
        this._countLines = 0;
        this._color = this._user.color;

        this._domMark = d3.select(parent.elem);
        this.svg = this._domMark.append("svg")
        .on("mousedown", this.mousedown.bind(this))
        .style("width", "100%")
        .style("height", "100%");

        this.svg.data = [];

        this.line = d3.line()
        .x(d => d[0])
        .y(d => d[1])
        .curve(d3.curveLinear);
        // this.metodChangeSVG = this.changeSVG.bind(this);
        // this.metodDrowNewLine = this.drowNewLine.bind(this);
        // this.metodDeleteAll = this.deleteAll.bind(this);
        mediator.on('layout:change', this._handleSVG.bind(this));
        // mediator.on('layout:change', this.deletePath.bind(this));
        // mediator.on('3d:turn', this.metodDeleteAll);
        // mediator.on('3d:zoom', this.metodDeleteAll);
        // mediator.on('3d:pan', this.metodDeleteAll);
        // mediator.on('marks:add', this.metodDrowNewLine);
    }

    // destruct(){
    //     mediator.off('layout:change', this.metodChangeSVG);
    //     mediator.off('3d:turn', this.metodDeleteAll);
    //     mediator.off('3d:zoom', this.metodDeleteAll);
    //     mediator.off('3d:pan', this.metodDeleteAll);
    //     mediator.off('marks:add', this.metodDrowNewLine);
    // }

    _onDownShiftPlusCtrl(e) {
        if (e.shiftKey === true && e.ctrlKey === true)
            this._flag = true;
    }

    _onUpShiftPlusCtrl(e) {
        if (e.shiftKey === true || e.ctrlKey === true) {
            this._flag = false;
        }
    }

    // changeSVG(obj){
    //     if (!this._flag) {
    //         return -1;
    //     }
    //
    //     if (this.id === obj.id) {
    //         this.changeProportions(obj.newWidth, obj.newHeight);
    //     }
    // }
    //
    // changeProportions(width, height) {
    //     this.svg
    //     .style("width", width)
    //     .style("height", height);
    // }

    deletePath(obj) {

        if (this.id === obj.id) {
            this.svg.selectAll("path").remove();
        }
    }

    mousedown() {
        if (!this._flag) {
            return -1;
        }

        let data = [];
        this.path = this.svg.append("path");
        this.path
        .attr("stroke", this._color)
        .attr("stroke-width", 4)
        .attr("fill", "none");

        this.svg
        .on("mousemove", () => {
            if (!this._flag) {
                this.svg
                .on("mousemove", null)
                .on("mouseup", null);
                return -1;
            }

            data.push(d3.mouse(this.svg.node()));
            this.path.attr("d", this.line(data));
        })
        .on("mouseup", () => {

            // mediator.emit('marks:add', {
            //     id: this.id,
            //     data: data,
            //     otherColor: this._color
            // });

            this.svg.on("mousemove", null);
            if (data.length) {
                this.svg.data[this._countLines++] = data.slice();
            }

            // setTimeout( this._serializeSVG.bind(this), 20);
            data = [];
        });
    }

    _serializeSVG () {
        let copy = this.svg.data;
        const payload = {
            userId: this._user.userId,
            svg: copy,
        };
        mediator.emit('layout:change', payload);
    }

    _handleSVG (payload) {
        if (payload.userId === this._user.userId && payload.svg) {
            this._restoreSVG.bind(this)(payload);
        }
    }

    _restoreSVG (payload) {
        const copy2 = {};


        console.log(this.svg);
        console.log(copy2);
        console.log(payload.svg);
    }

    // drowNewLine(obj) {
    //     //add handler to yourself
    //
    //     if (this.id === obj.id) {
    //         this.path
    //         .attr("stroke", obj.otherColor)
    //         .attr("d", this.line(obj.data));
    //     }
    // }
}

export default Marks;
