%{
    location = undefined;
    var path = require('path');
    var NumberNode = require(path.resolve('./src/nodes/numberNode.js'));
    var OperatorNode = require(path.resolve('./src/nodes/operatorNode.js'));
    var AssingmentNode = require(path.resolve('./src/nodes/assignmentNode.js'));
    var IDNode = require(path.resolve('./src/nodes/idNode.js'));
%}

%lex
%%
\s+                                             /* Skip */
\d+                                             return 'NUMBER';
"if"                                            return 'if'
[a-z][a-zA-Z0-9\_]*                             location = yylloc;return 'ID';
";"                                             return ';';
"="                                             return '=';
"+"|"-"|"*"|"/"|"^"|"!"                         return 'OPERATOR'
<<EOF>>                                         return 'EOF';
/lex

/* operator associations and precedence */

%left '+' '-'
%left '*' '/'
%left '^'
%right '!'
%right '%'

%start program%%

program
    : statements EOF { 
                    // console.log(JSON.stringify($$));
                    return $$;
       }
    ;

statements
    : statement {$$ = [$1];}
    | statements statement {$$ = $1, $$.push($2)}
    ;

statement
    : assignment ';'
    | expressions ';'
    ;

assignment
    : identifier '=' number  {$$ = new AssingmentNode($1,$3);}
    | identifier '=' identifier {$$ = new AssingmentNode($1,$3);}
    ; 

expressions
    : expression
    | number OPERATOR expressions { $$ = new OperatorNode($2,[$1,$3])}
    | identifier OPERATOR expressions { $$ = new OperatorNode($2,[$1,$3])}
    ;

expression
    : identifier  OPERATOR identifier { $$ = new OperatorNode($2,[$1,$3])}
    | identifier OPERATOR  number { $$ = new OperatorNode($2,[$1,$3])}
    | number OPERATOR  identifier { $$ = new OperatorNode($2,[$1,$3])}
    | number OPERATOR  number { $$ = new OperatorNode($2,[$1,$3])}
    ;

number
    : NUMBER {$$= new NumberNode(Number(yytext));}
    ;

identifier
    : ID {$$ = new IDNode(yytext,location)}
    ;