var OperatorNode = require('./nodes/operatorNode.js');
var NumberNode = require('./nodes/numberNode.js');
var IDNode = require('./nodes/idNode.js');
var AssingNode = require('./nodes/assignmentNode.js');
var IfNode = require('./nodes/ifNode.js');
var BooleanNode = require('./nodes/booleanNode.js');
var ElseNode = require('./nodes/elseNode.js');
var WhileNode = require('./nodes/whileNode.js');
var FuncNode = require('./nodes/funcNode.js');
var CallNode = require('./nodes/callNode.js');
var SymbolTable = require('./symbolTable.js');
var CompilationError = require('./error.js');


var SymenticsAnalyzer = function(){
	this.table = new SymbolTable();
}

SymenticsAnalyzer.prototype = {
	analyze : function(ast){
		for (var i = 0; i < ast.length; i++) {
			var node = ast[i];
			if (node instanceof AssingNode) {
				this.declareVar(node.key,node.value);
			}else if(node instanceof Array){
				this.analyze(node)
			}else if (this.isBlock(node)) {
				this.analyzeScope(node);
			}
			else if(node instanceof CallNode){
				if(this.isUndefiened(node.name)){
					this.throwUndefinedError(node.name.value,node.name.getLocation())
				}
				this.checkVariables(node.params);
			}
			else if (node instanceof OperatorNode) {
				this.checkVariables(node.args);
			}
		}
	},

	checkVariables : function(children){
		for (var i = 0;i < children.length; i++) {
			var child = children[i];
			if (child instanceof  OperatorNode) {
				this.checkVariables(child.args);
			}
			else if (this.isUndefiened(child)) {
				this.throwUndefinedError(child.value,child.getLocation())
			}
		}
	},

	declareVar : function(key,value){
		if (value instanceof IDNode){
			this.table.addSymbol(key,this.table.getSymbol(value));
		}
		else if(value instanceof OperatorNode){
			this.checkVariables(value.args);
			this.table.addSymbol(key,value);
		}
		else if(value instanceof FuncNode){
			this.analyzeScope(value);
			this.table.addSymbol(key,value);
		}
		else{
			this.table.addSymbol(key,value);
		}
	},

	analyzeScope : function(node){
		this.table = this.table.createChild();
		if (node.args) {
			this.declareArgs(node.args);
		}
		if (node.predicate && node.predicate instanceof OperatorNode) {
			this.checkVariables(node.predicate.args);
		}
		this.analyze(node.block);
		this.table = this.table.getParent();
	},

	isUndefiened : function(node){
		return !this.table.hasSymbol(node) && !(node instanceof NumberNode);
	},

	isBlock : function(node){
		return (node instanceof IfNode) || (node instanceof ElseNode) || (node instanceof WhileNode);
	},

	declareArgs : function(args){
		for (var i = 0; i < args.length; i++) {
			var arg = args[i];
			this.declareVar(arg,new BooleanNode('true'));
		};
		
	},
	throwUndefinedError : function(id,location){
		throw new CompilationError(id+" is not defined!",location);
	}

};

module.exports = SymenticsAnalyzer;