export type F={k:string;l:string;t:string;o?:string[];ref?:string};
export type Pg={p:string;t:string;g:string;coll:string;f:F[];desc:string;doc?:string;pre?:string;pay?:string;sts?:string[];st?:string;rep?:string;party?:string;cols?:string;flt?:string[]};
const f=(s:string):F[]=>s?s.split(',').map(x=>{const[k,l,t='text',o='']=x.split(':');return{k,l,t,o:t==='select'?o.split('|'):undefined,ref:t==='ref'?o:undefined}}):[];
export const DOCST=['Draft','Posted','Sent','In Payment','Partially Paid','Paid','Cancelled'];
const CN=['Draft','Posted','Cancelled'];
const P=(g:string,p:string,t:string,coll:string,fs:string,x:any={}):Pg=>({g,p,t,coll,f:f(fs),desc:`Browse, create and edit ${t.toLowerCase()} in this demo workspace.`,...x});
const R=(t:string,p:string,rep:string,desc:string):Pg=>({g:'Reports & Analytics',p:'reports/'+p,t,coll:'',f:[],rep,desc});
const PAY='ref:Payment Reference,party:Partner:text,date:Payment Date:date,journal:Journal:select:Bank|Cash,method:Payment Method:select:Bank Transfer|Cash|Cheque|UPI,amount:Amount:number,status:Status:select:Draft|Posted|Reconciled';
const CON='name:Name,company:Company,email:Email,phone:Phone,city:City,state:State,zip:Postal Code,country:Country,gstin:Tax ID,terms:Payment Terms,notes:Internal Notes:textarea,active:Status:select:Active|Archived';
const PRD='name:Product Name,ref:Internal Reference,type:Product Type:select:Service|Goods,price:Price:number,tax:Tax %:number,cost:Cost:number,active:Status:select:Active|Archived';
const J='journal:Journal:select:Sales|Purchase|Bank|Cash|Miscellaneous';
const S='status:Status:select:';
const ES='description:Description,number:Reference,product:Product:ref:eproducts,date:Date:date,total:Total:number,etax:Included Taxes:number,employee:Employee,manager:Manager,vendor:Vendor:ref:vendors,existing:Existing Bill:select:No (Direct Expense)|Yes (Match to Bill),bill:Matched Bill:ref:vbills,reimb:Reimbursement:select:Employee (Through a Purchase Receipt)|None (Paid by Company),account:Account,method:Payment Method:select:Manual Payment (Bank)|Cash|Company Card,notes:Notes:textarea,att:Receipt:file,status:Status:select:Draft|Submitted|Approved|Posted|Paid|Refused|In Payment';
export const PAGES:Pg[]=[
P('Customers','customers/invoices','Invoices','invoices','',{doc:'inv',pre:'INV',pay:'cpay',sts:DOCST,party:'customers',desc:'Create invoices, register payments and see what customers owe you.'}),
P('Customers','customers/credit-notes','Credit Notes','cnotes','',{doc:'cn',pre:'CN',sts:CN,party:'customers'}),
P('Customers','customers/payments','Payments','cpay',PAY),
P('Customers','customers/products','Products','products',PRD,{st:'active'}),
P('Customers','customers/contacts','Customers','customers',CON,{st:'active'}),
P('Vendors','vendors/bills','Bills','vbills','',{doc:'bill',pre:'BILL',pay:'vpay',sts:DOCST,party:'vendors',desc:'Record vendor bills and pay them on time.'}),
P('Vendors','vendors/refunds','Refunds','vrefunds','',{doc:'rf',pre:'RF',sts:CN,party:'vendors'}),
P('Vendors','vendors/payments','Payments','vpay',PAY),
P('Vendors','vendors/products','Products','vproducts',PRD,{st:'active'}),
P('Vendors','vendors/contacts','Vendors','vendors',CON,{st:'active'}),
P('Accounting','accounting/journal-entries','Journal Entries','journal','number:Entry Number,date:Date:date,'+J+',ref:Reference,party:Partner,debit:Debit:number,credit:Credit:number,'+S+'Draft|Posted',{desc:'Posting requires debits to equal credits.'}),
P('Accounting','accounting/pan-entity','PAN Entity','pan','name:Entity Name,pan:PAN (demo):text,company:Associated Company,'+S+'Active|Inactive,notes:Notes:textarea',{desc:'Demo details only — nothing is verified with any government service.'}),
P('Accounting','accounting/assets','Assets','assets','name:Asset Name,category:Category,date:Acquisition Date:date,value:Original Value:number,method:Depreciation Method:select:Straight Line|Declining Balance,life:Useful Life (yrs):number,residual:Residual Value:number,'+S+'Running|Draft|Sold'),
P('Accounting','accounting/loans','Loans','loans','name:Loan Name,lender:Lender,principal:Principal:number,rate:Interest %:number,start:Start Date:date,end:End Date:date,installment:Installment:number,balance:Outstanding Balance:number,'+S+'Active|Closed'),
P('Accounting','accounting/reconcile','Reconcile','bank','date:Statement Date:date,desc:Description,ref:Reference,amount:Amount:number,match:Matching Invoice/Bill,'+S+'Unmatched|Matched|Reconciled',{desc:'Simulated bank feed. Match, unmatch and reconcile lines.'}),
P('Accounting','accounting/tax-returns','Tax Returns','taxret','period:Tax Period,type:Return Type:select:GSTR-1|GSTR-3B|TDS,base:Taxable Amount:number,collected:Tax Collected:number,paid:Tax Paid:number,net:Net Liability:number,'+S+'Draft|Filed (simulated)'),
P('Accounting','accounting/lock-dates','Lock Dates','locks','kind:Lock Type:select:Tax|Sales|Purchase|Accounting,date:Lock Date:date,note:Note'),
P('Review & Audit','review/journal-items','Journal Items','jitems','date:Date:date,account:Account,partner:Partner,label:Label,debit:Debit:number,credit:Credit:number'),
P('Review & Audit','review/audit-trail','Audit Trail','audit','date:Date:date,user:User,action:Action,record:Record'),
P('Review & Audit','review/journal-audit','Journal Audit','jaudit','journal:Journal,check:Check,'+S+'Passed|Review'),
P('Review & Audit','review/working-files','Working Files','wfiles','name:File Name,type:Type,date:Uploaded:date,'+S+'Final|Draft'),
P('Review & Audit','review/annual-report','Annual Report','annual','section:Section,fy:Financial Year,amount:Amount:number,'+S+'Final|Draft'),
P('Review & Audit','review/inventory-valuation','Inventory Valuation','inv_val','name:Product,qty:Quantity:number,cost:Unit Cost:number,value:Inventory Value:number'),
P('Review & Audit','review/deferred-revenues','Deferred Revenues','defrev','name:Description,date:Start Date:date,amount:Amount:number,periods:Periods:number,'+S+'Running|Draft|Done'),
P('Review & Audit','review/deferred-expenses','Deferred Expenses','defexp','name:Description,date:Start Date:date,amount:Amount:number,periods:Periods:number,'+S+'Running|Draft|Done'),
R('Balance Sheet','balance-sheet','bs','Assets, liabilities and equity at a glance.'),
R('Profit and Loss','profit-loss','pl','Revenue against expenses for the period.'),
R('Cash Flow Statement','cash-flow','cash','Operating, investing and financing cash movement.'),
R('Depreciation Schedule','depreciation','dep','Asset depreciation by period.'),
R('Trial Balance','trial-balance','tb','Debit and credit balances per account.'),
R('General Ledger','general-ledger','ledger','Every posted line with a running balance.'),
R('Partner Ledger','partner-ledger','ledger','Customer and vendor transactions.'),
R('Customer Statement','customer-statement','stmt','What each customer has been billed and paid.'),
R('Aged Receivable','aged-receivable','ar','Unpaid customer invoices by age.'),
R('Aged Payable','aged-payable','ap','Unpaid vendor bills by age.'),
R('Tax Report','tax-report','tax','Taxable base and tax by rate.'),
R('Fiscal Report','fiscal-report','tax','Fiscal-period tax summary.'),
R('Invoice Analysis','invoice-analysis','inv','Revenue and collections by customer.'),
R('Cashflow Analysis','cashflow-analysis','cash','Inflows, outflows and trends.'),
R('Analytic Report','analytic-report','pl','Margin by analytic category.'),
R('Executive Summary','executive-summary','exec','Key indicators for leadership.'),
R('Loans Analysis','loans-analysis','loans','Principal, balance and maturity.'),
P('Configuration','config/settings','Settings','company','name:Company Name,street:Address,gstin:GSTIN,pan:PAN,email:Email,phone:Phone,website:Website,city:City,state:State,zip:Postal Code,country:Country,currency:Currency'),
P('Configuration','config/online-payments','Online Payments','providers','name:Provider,mode:Mode:select:Test|Disabled,'+S+'Configured (demo)|Not configured',{desc:'Test mode only. No real credentials are collected.'}),
P('Configuration','config/chart-of-accounts','Chart of Accounts','coa','code:Account Code,name:Account Name,type:Account Type:select:Asset|Liability|Equity|Income|Expense,recon:Allow Reconciliation:select:Yes|No,currency:Currency,active:Active:select:Active|Archived',{st:'active'}),
P('Configuration','config/taxes','Taxes','taxes','name:Tax Name,type:Tax Type:select:GST|IGST|TDS,rate:Rate %:number,scope:Scope:select:Sales|Purchases,group:Tax Group,active:Active:select:Active|Archived',{st:'active'}),
P('Configuration','config/journals','Journals','journals','name:Journal Name,type:Type:select:Sales|Purchase|Bank|Cash|Miscellaneous,code:Short Code,account:Default Account,currency:Currency,active:Active:select:Active|Archived',{st:'active'}),
P('Configuration','config/currencies','Currencies','currencies','name:Currency,code:Code,symbol:Symbol,dec:Decimal Places:number,active:Active:select:Active|Archived',{st:'active'}),
P('Configuration','config/fiscal-positions','Fiscal Positions','fiscal','name:Name,from:Tax Mapped From,to:Tax Mapped To,account:Account Mapping'),
P('Configuration','config/multi-ledger','Multi-Ledger','ledgers','name:Ledger,company:Company,currency:Currency,'+S+'Active|Inactive'),
P('Configuration','config/rounding','Rounding Methods','rounding','name:Method,precision:Precision:number,method:Rounding:select:Half Up|Up|Down'),
P('Configuration','config/checks','Checks','checks','number:Cheque Number,bank:Bank,partner:Partner,amount:Amount:number,issue:Issue Date:date,due:Due Date:date,'+S+'Draft|Issued|Cleared'),
P('Configuration','config/depreciation-models','Depreciation Models','depmodels','name:Model,method:Method:select:Straight Line|Declining Balance,life:Useful Life (yrs):number,freq:Frequency:select:Monthly|Yearly,residual:Residual Value:number'),
P('Configuration','config/return-types','Return Types','rtypes','name:Return,type:Type,freq:Filing Frequency:select:Monthly|Quarterly|Yearly,period:Applicable Period,'+S+'Active|Inactive'),
P('Configuration','config/invoice-reminders','Invoice Reminders','reminders','name:Reminder,days:Days After Due:number,template:Template,'+S+'Enabled|Disabled'),
P('Configuration','config/payment-terms','Payment Terms','terms','name:Name,days:Days:number,note:Note'),
P('Configuration','config/product-categories','Product Categories','cats','name:Category,parent:Parent,active:Active:select:Active|Archived',{st:'active'}),
P('My Expenses','expenses/all','My Expenses','expenses',ES,{cols:'employee,description,date,product,vendor,total,att,status',desc:'Create expenses, attach receipts and follow approvals.'}),
P('My Expenses','expenses/to-process','Expenses to Process','expenses',ES,{cols:'employee,description,date,product,total,att,status',flt:['Submitted','Approved'],desc:'Review, approve or refuse expenses that need action.'}),
{g:'Expense Reporting',p:'expenses/analysis',t:'Expenses Analysis',coll:'',f:[],rep:'expana',desc:'Trends, categories and employees from your saved expenses.'},
P('Expense Configuration','expenses/settings','Settings','esettings','account:Default Expense Account,currency:Default Currency,method:Default Payment Method,receiptReq:Receipt Required:select:No|Yes,approval:Approval:select:Manager|Auto-validation,reimb:Reimbursement:select:Employee (Through a Purchase Receipt)|None (Paid by Company),tax:Default Tax',{desc:'Defaults applied to new expenses.'}),
P('Expense Configuration','expenses/products','Expense Products','eproducts','name:Product Name,ref:Internal Reference,price:Default Price:number,account:Expense Account,tax:Tax %:number,active:Status:select:Active|Archived',{st:'active'}),
];
export const EXPG=['My Expenses','Expense Reporting','Expense Configuration'];
export const GROUPS=['Customers','Vendors','Accounting','Review & Audit','Reports & Analytics','Configuration'];
