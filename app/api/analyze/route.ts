type Input={company:string;product:string;description:string;pricingUrl:string;segment:string;monthlyCommitment:number;monthlyCost:number;creditUtilization:number;multiProductAdoption:number;annualChurn:number;targetMargin:number;experimentLift:number;apiKey?:string;demo?:boolean};
type Source={title:string;url:string;snippet?:string;primitive:string};
const demoSources:Source[]=[
 {title:"LangSmith plans and pricing",url:"https://www.langchain.com/pricing",snippet:"Portfolio plans, usage units, allowances, and product-level metering.",primitive:"FETCH"},
 {title:"Braintrust pricing",url:"https://www.braintrust.dev/pricing",snippet:"An adjacent observability and evaluation packaging reference.",primitive:"SEARCH"},
 {title:"Langfuse pricing",url:"https://langfuse.com/pricing",snippet:"Open-source and cloud packaging for traces and evaluation workflows.",primitive:"FETCH"},
 {title:"Arize pricing",url:"https://arize.com/pricing/",snippet:"A market reference for observability and evaluation packaging.",primitive:"SEARCH"}
];
const clamp=(n:number,min:number,max:number)=>Math.min(max,Math.max(min,n));
const num=(n:unknown,fallback:number)=>Number.isFinite(Number(n))?Number(n):fallback;

function buildDecision(input:Input,mode:"live"|"demo",sources:Source[],agentEvidence="",warnings:string[]=[]){
 const commitment=num(input.monthlyCommitment,12000),cost=num(input.monthlyCost,2600),utilization=clamp(num(input.creditUtilization,68),0,200),adoption=clamp(num(input.multiProductAdoption,42),0,100),churn=clamp(num(input.annualChurn,9),0,100),target=clamp(num(input.targetMargin,78),0,99),lift=clamp(num(input.experimentLift,11),-100,300),margin=Math.round((1-cost/Math.max(commitment,1))*100);
 let recommendation="Use a hybrid portfolio: platform access plus a shared commitment pool",rationale="Shared credits lower the friction to try adjacent products, while product-specific consumption rates protect margin. Add utilization alerts and a right-sized entry commitment so unused credits do not become renewal risk.",confidence="Medium–high",recommendedScenario="Balanced hybrid";
 if(utilization<45||churn>14){recommendation="Reduce the entry commitment and earn the portfolio expansion";rationale="Low utilization or elevated churn signals that the current commitment may get ahead of realized value. Preserve portfolio access, but start with a smaller pool, milestone-based expansion, and rollover protection during onboarding.";confidence="High on direction";recommendedScenario="Adoption-led"}
 else if(margin<target-5){recommendation="Keep shared credits, but introduce product-specific multipliers and floors";rationale="The portfolio model supports discovery, but modeled margin is below target. Price high-cost workloads with transparent conversion rates and minimum commitments instead of fragmenting the suite into separate SKUs.";confidence="Medium";recommendedScenario="Margin-led"}
 else if(adoption>65&&utilization>85){recommendation="Graduate healthy accounts into larger annual portfolio commitments";rationale="High utilization and broad adoption indicate that customers understand the portfolio value. Offer committed-use discounts with clear overage pricing and renewal forecasts rather than limiting product access.";recommendedScenario="Margin-led"}
 const aC=Math.round(commitment*.78/100)*100,bC=Math.round(commitment*1.02/100)*100,mC=Math.round(commitment*1.24/100)*100;
 return {mode,recommendation,rationale,confidence,recommendedScenario,architecture:"Platform + shared credits + workload multipliers",signals:[{label:"MODELED GROSS MARGIN",value:`${margin}%`,status:margin>=target?"healthy":"watch"},{label:"CREDIT UTILIZATION",value:`${utilization}%`,status:utilization>=55?"healthy":"watch"},{label:"MULTI-PRODUCT ADOPTION",value:`${adoption}%`,status:adoption>=50?"healthy":"watch"},{label:"ANNUAL CHURN",value:`${churn}%`,status:churn<=10?"healthy":"watch"}],scenarios:[
  {name:"Adoption-led",commitment:aC,margin:Math.round((1-cost*1.06/Math.max(aC,1))*100),adoption:clamp(Math.round(adoption+lift*.9),0,100),churn:clamp(Math.round(churn-lift*.12),0,100),description:"Lower entry commitment, generous exploration allowance, and 90-day rollover."},
  {name:"Balanced hybrid",commitment:bC,margin:Math.round((1-cost/Math.max(bC,1))*100),adoption:clamp(Math.round(adoption+lift*.55),0,100),churn:clamp(Math.round(churn-lift*.08),0,100),description:"Portfolio access with shared credits, workload multipliers, and proactive utilization guidance."},
  {name:"Margin-led",commitment:mC,margin:Math.round((1-cost*.98/Math.max(mC,1))*100),adoption:clamp(Math.round(adoption-4),0,100),churn:clamp(Math.round(churn+2),0,100),description:"Higher minimum, tighter allowances, and product-specific floors for costly workloads."}
 ],experiment:{hypothesis:"A guided shared-credit package will increase cross-product activation without increasing churn.",control:"Current portfolio commitment and standard onboarding.",variant:"Same portfolio access, 15% smaller entry pool, 90-day rollover, and utilization nudges at 30/60/80%.",primary:"90-day multi-product activation",guardrails:["gross margin","180-day churn","support load"]},sources,agentEvidence,warnings};
}

async function tinyfishSearch(key:string,input:Input){
 const query=`${input.company} ${input.product} pricing alternatives competitors observability evaluations agent platform`,params=new URLSearchParams({query,location:"US",language:"en",purpose:`Discover direct and adjacent pricing alternatives for ${input.company}'s ${input.product}`});
 const response=await fetch(`https://api.search.tinyfish.ai?${params}`,{headers:{"X-API-Key":key},signal:AbortSignal.timeout(20000)});if(!response.ok)throw new Error(`Search returned ${response.status}`);return response.json() as Promise<{results?:Array<{title?:string;url?:string;snippet?:string}>}>;
}
async function tinyfishFetch(key:string,urls:string[],input:Input){
 const response=await fetch("https://api.fetch.tinyfish.ai",{method:"POST",headers:{"X-API-Key":key,"Content-Type":"application/json"},body:JSON.stringify({urls:urls.slice(0,6),format:"markdown",ttl:0,purpose:`Normalize pricing metrics, packaging, allowances, commitments, and value fences for ${input.product}`}),signal:AbortSignal.timeout(30000)});if(!response.ok)throw new Error(`Fetch returned ${response.status}`);return response.json() as Promise<{results?:Array<{title?:string;url?:string;text?:string}>}>;
}
async function tinyfishAgent(key:string,input:Input){
 const goal=`Inspect this public pricing experience for ${input.company} and extract the visible pricing and packaging model. If a usage calculator is immediately available, configure one scenario for ${input.segment}; otherwise do not search beyond this page. Do not submit forms, sign up, or contact sales. Return JSON with: pricing_model, platform_fee, included_allowances, usage_metrics, commitment_or_credit_mechanics, enterprise_value_fences, calculator_scenario, and source_notes. Clearly mark unavailable fields.`;
 const response=await fetch("https://agent.tinyfish.ai/v1/automation/run-sse",{method:"POST",headers:{"X-API-Key":key,"Content-Type":"application/json"},body:JSON.stringify({url:input.pricingUrl,goal}),signal:AbortSignal.timeout(75000)});if(!response.ok)throw new Error(`Agent returned ${response.status}`);const text=await response.text(),lines=text.split("\n").filter(line=>line.startsWith("data: "));
 for(let i=lines.length-1;i>=0;i--){try{const event=JSON.parse(lines[i].slice(6));if(event.resultJson)return typeof event.resultJson==="string"?event.resultJson:JSON.stringify(event.resultJson,null,2)}catch{}}
 return text.slice(-3000);
}

export async function POST(request:Request){
 try{
  const input=await request.json() as Input;if(!input.company?.trim()||!input.product?.trim())return Response.json({error:"Company and product are required."},{status:400});
  const numericInputs=[input.monthlyCommitment,input.monthlyCost,input.creditUtilization,input.multiProductAdoption,input.annualChurn,input.targetMargin,input.experimentLift];
  if(numericInputs.some(value=>!Number.isFinite(Number(value))))return Response.json({error:"All economic inputs must be valid numbers."},{status:400});
  if(input.monthlyCommitment<=0||input.monthlyCost<0)return Response.json({error:"Monthly commitment must be greater than zero and cost to serve cannot be negative."},{status:400});
  if([input.creditUtilization,input.multiProductAdoption,input.annualChurn,input.targetMargin].some(value=>value<0||value>100))return Response.json({error:"Utilization, adoption, churn, and target margin must be between 0% and 100%."},{status:400});
  if(input.demo)return Response.json(buildDecision(input,"demo",demoSources,"Demo mode: Agent would operate the public pricing page and return structured calculator observations."));
  try{const url=new URL(input.pricingUrl);if(!["http:","https:"].includes(url.protocol))throw new Error()}catch{return Response.json({error:"Enter a valid HTTP or HTTPS pricing page URL for a live run."},{status:400})}
  const key=input.apiKey?.trim()||process.env.TINYFISH_API_KEY;if(!key)return Response.json({error:"Add a TinyFish API key to run live, or use demo mode."},{status:400});
  const warnings:string[]=[];let search:{results?:Array<{title?:string;url?:string;snippet?:string}>}={results:[]};
  try{search=await tinyfishSearch(key,input)}catch(error){warnings.push(error instanceof Error?`Search: ${error.message}`:"Search step failed")}
  const discovered=(search.results||[]).filter(x=>x.url).slice(0,6),urls=Array.from(new Set([input.pricingUrl,...discovered.map(x=>x.url as string)])).slice(0,6);
  const [fetchResult,agentResult]=await Promise.allSettled([tinyfishFetch(key,urls,input),tinyfishAgent(key,input)]);
  if(fetchResult.status==="rejected")warnings.push(fetchResult.reason instanceof Error?fetchResult.reason.message:"Fetch step failed");if(agentResult.status==="rejected")warnings.push(agentResult.reason instanceof Error?agentResult.reason.message:"Agent step failed");
  const fetched=fetchResult.status==="fulfilled"?fetchResult.value.results||[]:[],sources:Source[]=discovered.map(item=>({title:item.title||new URL(item.url as string).hostname,url:item.url as string,snippet:item.snippet,primitive:"SEARCH"}));
  fetched.forEach(item=>{if(!item.url||sources.some(source=>source.url===item.url))return;sources.push({title:item.title||new URL(item.url).hostname,url:item.url,snippet:item.text?.replace(/[#*_`]/g,"").slice(0,180),primitive:"FETCH"})});
  if(input.pricingUrl&&!sources.some(source=>source.url===input.pricingUrl))sources.unshift({title:`${input.company} pricing experience`,url:input.pricingUrl,snippet:"Inspected through a live browser agent.",primitive:"AGENT"});
  return Response.json(buildDecision(input,"live",sources.slice(0,10),agentResult.status==="fulfilled"?agentResult.value:"",warnings));
 }catch(error){return Response.json({error:error instanceof Error?error.message:"Unexpected analysis error"},{status:500})}
}
