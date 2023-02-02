"use strict";

/*

Virtual HTML is an alternative to a template system.

*/

// -------------------- (\_) SimpleHTMLNode (_/) -------------------- //

class SimpleHTMLNode
{
	constructor()
	{
		this._parent = null;
	}

	toString(tab)
	{
		throw Error("toString(tab) is not implemented");
	}
}

// -------------------- (\_) SimpleHTMLTextNode (_/) -------------------- //

class SimpleHTMLTextNode extends SimpleHTMLNode
{
	constructor(text)
	{
		super();
		this.text = text.toString() || "";
	}

	toString()
	{
		return this.text.toString();
	}
}

// --------------------  (\_) SimpleHTMLCommentNode (_/) -------------------- //

class SimpleHTMLCommentNode extends SimpleHTMLNode
{
	constructor(text)
	{
		super();
		this.text = text || "";
	}

	toString()
	{
		return "<!-- " + this.text.toString() + " -->";
	}
}

// --------------------  (\_) SimpleHTMLStyle (_/) -------------------- //

class SimpleHTMLStyle
{
// ------------- PUBLIC STATIC METHODS ------------- //

	static get(style)
	{
		return style instanceof SimpleHTMLStyle ?
					style :
					new SimpleHTMLStyle(style);
	}

	static getDeclaration(value)
	{
		return 	value === null ||
				value === undefined ||
				typeof(value) == "function" ?
					null :
					value.toString();
	};

	static toString(style, tab)
	{
		return this.prototype.toString.call(style, tab);
	}

// ------------- CONSTRUCTOR ------------- //

	constructor(style = {})
	{
		Object.getOwnPropertyNames(style).forEach(name =>
		{
			this[name] = style[name];
		});
	}

// ------------- PUBLIC METHODS ------------- //

	copy(style)
	{
		Object.getOwnPropertyNames(style).forEach(name =>
		{
			var v = SimpleHTMLStyle.getDeclaration(style[name]);
			if(v !== null)
			{
				this[name] = v;
			}
		});
		return this;
	}

	toString(tab)
	{
		var noTab = !tab && typeof(tab) !== "string",
			tabStr = noTab ? "" : (tab || ""),
			sep = noTab ? " " : "\n";
		
		return Object.getOwnPropertyNames(this).map(name =>
		{
			var v = SimpleHTMLStyle.getDeclaration(this[name]);
			if(v === null)
			{
				return "";
			}
			var cssName = name.replace(/([A-Z])/g,
							function(str, arg1)
							{
								return "-" + arg1.toLowerCase();
							});
			return tabStr + cssName + ": " + v + ";" + sep; 
		}).join("");
	}
}

// -------------------- (\_) SimpleHTMLStyleNode (_/) -------------------- //

class SimpleHTMLStyleNode extends SimpleHTMLNode
{
// ------------- CONSTRUCT ------------- //

	constructor(style)
	{
		super();
		this._style = {};
		if(style)
		{
			this.add(style);
		}
	}

// ------------- PUBLIC METHODS ------------- //

	get(selector)
	{
		return this._style[selector];
	}
	
	set(selector, style)
	{
		if(typeof(selector) == "object")
		{
			return this.#applyFromObject(selector, this.set);
		}
		this._style[selector] = SimpleHTMLStyle.get(style);
		return this;
	}

	add(selector, style)
	{
		if(typeof(selector) == "object")
		{
			return this.#applyFromObject(selector, this.add);
		}
		if(typeof(style) == "object")
		{
			if(this._style[selector])
			{
				this._style[selector].copy(style);
			}
			else
			{
				this._style[selector] = SimpleHTMLStyle.get(style);
			}
		}
		return this;
	}

	// style can be a simple object or a SimpleHTMLStyleNode
	copy(style)
	{
		return this.add(style instanceof SimpleHTMLStyleNode ?
							style._style : style);
	}

	toString(tab)
	{
		const style = this._style, tab2 = tab + "\t";
		return "\n" + Object.getOwnPropertyNames(style).map(name =>
		{
			return 	tab + name + "\n" + tab + "{\n" +
					SimpleHTMLStyle.toString(style[name], tab2) +
					tab + "}\n\n";
		}).join("");
	}

// ------------- PRIVATE METHODS ------------- //

	#applyFromObject(style, func)
	{
		Object.getOwnPropertyNames(style).forEach(name =>
		{
			func.call(this, name, style[name]);
		});
		return this;
	}
}

// -------------------- (\_) SimpleHTMLElement (_/) -------------------- //

/**
* An HTML element.
*/
class SimpleHTMLElement extends SimpleHTMLNode
{
// ------------- PUBLIC PROPERTIES ------------- //

	get length()
	{
		return this._children.length;
	}

	/**
	* The parent of the node.
	* @member {SimpleHTMLElement} parent
	*/
	get parent()
	{
		return this._parent;
	}

	/**
	* Gets the parent of the node. Usefull to go back
	* when operations are chained.
	* @returns SimpleHTMLElement
	*/
	get "<"()
	{
		return this._parent;
	}

	/**
	* Gets the parent of the parent of the node. Usefull to go back
	* when operations are chained.
	* @returns SimpleHTMLElement
	*/
	get "<<"()
	{
		return this._parent ? this._parent._parent : undefined;
	}

	/**
	* Gets the parent of the parent of the parent of the node.
	* Usefull to go back when operations are chained.
	* @returns SimpleHTMLElement
	*/
	get "<<<"()
	{
		return this._parent ? this._parent["<<"] : undefined;
	}

	/**
	* Gets the parent of the parent of the parentof the parent
	* of the node. Usefull to go back when operations are chained.
	* @returns SimpleHTMLElement
	*/
	get "<<<<"()
	{
		return this._parent ? this._parent["<<"] : undefined;
	}

// ------------- CONSTRUCTOR ------------- //

	constructor(name, attributes, content)
	{
		super();

		this.name = name;
		this.attributes = attributes;

		this._children = [];
		this._conditions = [];

		if(content instanceof Array)
		{
			this.table(content);
		}
		else if(content !== undefined && content !== null)
		{
			this.push(content);
		}
	}

// ------------- PUBLIC METHODS ------------- //

	/**
	* Gets the parent of the node. usefull to go back
	* when operations are chained.
	* @returns SimpleHTMLElement
	*/
	$()
	{
		return this._parent;
	}

	at(i)
	{
		return this._children[i];
	}

	each(func)
	{
		this._children.forEach(func, this);
		return this;
	}

	push(...nodes)
	{
		const cond = this._lastCondition,
			  invalidStatements = ["if", "endthen", "endelse", "endelif"];
		for(var i = 0, l = nodes.length, node; i < l; i++)
		{
			node = nodes[i];
			if(!(node instanceof SimpleHTMLNode))
			{
				node = typeof(node) == "object" ?
								new SimpleHTMLStyleNode(node) :
								new SimpleHTMLTextNode(node);
			}
			if(cond && invalidStatements.indexOf(cond.step) != -1)
			{
				throw Error("Cannot push an element after a condition statement: the condition should be ended with endif().");
			}
			if(node._parent)
			{
				node._parent.remove(node);
			}
			node._parent = this;
			this._children.push(node);
		}
		
		return this;
	}

	remove(elt)
	{
		var i;
		if(typeof(elt) == "number")
		{
			i = elt;
			elt = this._children[i];
		}
		else
		{
			i = this._children.indexOf(elt);
		}
		if(elt && i != -1)
		{
			this._children.splice(i, 1);
			elt._parent = null;
		}

		return this;
	}

	attrsToString()
	{
		const attrs = this.attributes;
		if(!attrs)
		{
			return "";
		}
		return Object.getOwnPropertyNames(attrs).map(name =>
		{
			var v = attrs[name];
			if(typeof(v) == "function" || v === null || v === undefined)
			{
				return "";
			}
			v = v.toString();
			return name + "=\"" + v.replace(/&/g, "&amp;").replace(/"/g, "&quot;") + "\"";
		}).join(" ");
	}

	toString(tab)
	{
		tab = tab || "";
		const attrs = this.attrsToString(),
			  name = this.name.toLowerCase();

		if(this._children.length == 0 && this.name == "br" || this.name == "meta")
		{
			return tab + "<" + name + (attrs ? " " + attrs : "") + "/>";
		}

		var tab2 = tab + "\t",
			close = "</" + name + ">",
			isBlock = INLINE.indexOf(name) === -1,
			eltCount = 0,
			ln = isBlock ? "\n" : "";

		return  ln + tab + "<" + name + (attrs ? " " + attrs : "") + ">" +
					this._children.map((e, i) =>
					{
						eltCount += e instanceof SimpleHTMLElement || e instanceof SimpleHTMLStyleNode;
						return e.toString(tab2, i)
					}).join("") +
				(isBlock && eltCount ? tab : "") + close + ln;
	}

	e(name, attrs, content)
	{
		// AUtomatic table or ul if the first argument is an array
		if(name && name instanceof Array)
		{
			if(!name.length || name[0] && name[0] instanceof Array)
			{
				return this.table(name, attrs);
			}
			return this.ul(name, attrs);
		}

		// No attributes (name, content)
		if( content === undefined &&
			(typeof(attrs) !== "object" ||
			attrs instanceof Array ||
			attrs instanceof SimpleHTMLNode))
		{
			content = attrs;
			attrs = undefined;
		}

		const elt = new SimpleHTMLElement(name, attrs, content);
		this.push(elt);

		return elt;
	}

	table(attrs, content)
	{
		if(attrs && attrs instanceof Array)
		{
			content = attrs;
			attrs = null;
		}

		// Default attributes
		if(!attrs) attrs = {};
		if(attrs.cellpadding === undefined) attrs.cellpadding = "0";
		if(attrs.cellspacing === undefined) attrs.cellspacing = "0";
		if(attrs.cellpadding === undefined) attrs.border = "0";

		// Creates the element
		const elt = this.e("table", attrs);

		if(content)
		{
			for(var i = 0, line, tr, j; i < content.length; i++)
			{
				line = content[i];
				if(line)
				{
					tr = elt.e("tr");
					for(j = 0; j < line.length; j++)
					{
						tr.e("td", line[j]);
					}
				}
			}
		}

		return elt;
	}

	ul(attrs, content)
	{
		return this._list("ul", attrs, content);
	}

	ol(attrs, content)
	{
		return this._list("ol", attrs, content);
	}

	style(attrs, content)
	{
		if(!content)
		{
			content = attrs;
			attrs = undefined;
		}
		
		if(content && !(content instanceof SimpleHTMLStyleNode))
		{
			content = new SimpleHTMLStyleNode(content);
		}

		return this.e("style", attrs, content);
	}

	comment(text)
	{
		var e = text && text instanceof SimpleHTMLCommentNode ? text :
					new SimpleHTMLCommentNode(text);
		return this.push(e);
	}

	text(text)
	{
		var e = text && text instanceof SimpleHTMLTextNode ? text :
					new SimpleHTMLTextNode(text);
		return this.push(e);
	}

	if(condition)
	{
		const cond = {condition: condition ? true : false, step: "if",
					  closeStep: () => cond.step = "end" + cond.step};
		this._conditions.push(cond);
		return this;
	}

	then(cb)
	{
		this._ifStep("then", ["if"], cb,
					this._lastCondition.condition);
		return this;
	}

	elif(condition, cb)
	{
		if(!this._lastCondition.condition)
		{
			const cond = this._ifStep("elif", ["endthen", "if"],
									cb, condition);
			cond.condition = condition;
		}
		return this;
	}

	else(cb)
	{
		this._ifStep("else", ["endthen", "endelif", "if"],
					 cb, !this._lastCondition.condition);
		return this;
	}

	endif()
	{
		this._ifStep("endif", ["endthen", "endelse", "endelif", "if"]);
		this._conditions.pop();
		return this;
	}

// ------------- PROTECTED METHODS ------------- //

	get _lastCondition()
	{
		return this._conditions[this._conditions.length - 1];
	}

	_ifStep(step, previous, cb = null, condition = true)
	{
		// Gets the last condition and checks if it exists
		const cond = this._lastCondition;
		if(!cond)
		{
			throw Error("Invalid call to then: no declaration was done.");
		}
		
		// Checks the previous instruction
		if(previous.indexOf(cond.step) == -1)
		{
			const a = cond.step == "if" || cond.substr(0, 3) == "end" ?
						"after" : "inside";
			throw Error(`The ${step} instruction must be called ${a} ${previous.join(" or ")}.`);
		}

		// Sets the current step
		cond.step = step;

		// Calls the callback if needed
		if(condition && cb)
		{
			cb.call(this, this);
		}
	
		// Closes the condition
		cond.closeStep();

		// Returns the condition object
		return cond;
	}

	_list(name, attrs, content)
	{
		if(attrs && attrs instanceof Array)
		{
			content = attrs;
			attrs = null;
		}

		// Creates the element
		const elt = this.e(name, attrs);

		if(content)
		{
			for(var i = 0, c; i < content.length; i++)
			{
				c = content[i];
				c && c instanceof Array ? 
					elt.li.apply(elt, c) :
					elt.li(c);
			}
		}
		
		return elt;
	}
}

// -----> Adds shortcut to the creation of html elements

["title", "meta", "iframe",
"a", "br", "code", "dl", "dd", "dt",
"blockquote", "center", "section", "article",
"form", "footer", "header", "address",
"details", "summary", "select", "option", "optgroup",
"img", "map", "area", "small", "sub", "sup",
"input", "label", "button", "canvas",
"h1", "h2", "h3", "h4", "h5", "h6",
"div", "pre", "p", "li", "nav", "span",
"i", "b", "em", "u", "s", "hr", "strong"].forEach(function(name)
{
	if(!SimpleHTMLElement.prototype[name])
	{
		SimpleHTMLElement.prototype[name] = new Function("attrs, content",
													"return this.e(\"" + name + "\", attrs, content)");
	}
});

const INLINE = ["span", "i", "u", "b", "s", "strong", "em", "a", "label",
				"code", "small", "sub", "sup", "img", "br", "hr"];

// -------------------- (\_) SimpleHTMLDocument (_/) -------------------- //

const fs = require("fs");

class SimpleHTMLDocument extends SimpleHTMLElement
{
	get SimpleHTMLElement(){return SimpleHTMLElement;}
	get SimpleHTMLNode(){return SimpleHTMLNode;}
	get SimpleHTMLTextNode(){return SimpleHTMLTextNode;}
	get SimpleHTMLCommentNode(){return SimpleHTMLCommentNode;}
	get SimpleHTMLStyleNode(){return SimpleHTMLStyleNode;}
	get INLINE(){return INLINE;}

	constructor(doctype, title, charset, style)
	{
		super("html");

		this.doctype = doctype || "<!DOCTYPE HTML>";
		
		this.head = this.e("head");
		this.body = this.e("body");

		if(title)
		{
			this.head.title(title);
		}
		if(charset)
		{
			this.head.meta({charset: charset});
		}
		if(typeof(style) == "string")
		{
			style = Object.assign({}, SimpleHTMLDocument.STYLES[style]);
		}
		if(style)
		{
			this.head.style(style);
		}
	}

	toString()
	{
		const str = SimpleHTMLElement.prototype.toString.call(this);
		return  this.doctype + "\n" + str;
	}

	save(path, grunt = null)
	{
		if(grunt)
		{
			grunt.file.write(path, html.toString(),
							{encoding: "utf-8"});
			return this;
		}
		fs.writeFileSync(path, this.toString(), {encoding: "utf-8"});
		return this;
	}
}

SimpleHTMLDocument.STYLES =
{
	default:
	{
		"html, body": {background: "#fff", margin: "0px", padding: "0px"},

		"html, div, p, table, tr": 
		{
			"font-family": "Verdana",
			color: "#000",
			"font-size": "14px"
		},

		"h1, h2": {"border-bottom": "1px solid #aaa"},
		"h1":
		{
			"font-size": "200%",
			padding: "4px",
			color: "#333",
			background: "linear-gradient(to top, #bbb 0%, #ccc 15%, #fff 100%)",
			"margin-top": "0px"
		},

		"table": {border: "1px solid #ccc;"},
		"tr": {border: "0px"},
		"td": {"padding": "3px", border: "0px"},
		"td:first-of-type": {"font-weight": "bold", "padding-right": "20px"},
		"tr:nth-child(2n) td": {background: "#eee"},

		"li[even=yes] > div": {background: "#eee"},

		"ul.lines li:nth-child(2n)": {background: "#eee"},
		"ul.lines li:nth-child(2n+1)": {background: "#fff"},
		"li": {"list-style-type": "disc"},
		"li[position=\"after\"] > div": {"font-style": "italic"},

		".box": 
		{
			background: "linear-gradient(45deg, #d3d3d3, #fafafa)",
			border: "1px solid #aaa",
			padding: "5px",
			margin: "5px"
		}
	}
};

module.exports = SimpleHTMLDocument;