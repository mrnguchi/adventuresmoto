import { getAdmin, database } from "@/lib/admin/auth";
import { deliverOrderEmails, smtpReady } from "@/lib/order-email";
import { revalidatePath } from "next/cache";
import type { OrderStatus } from "@/generated/prisma/client";
export async function POST(request: Request) {
  if(request.headers.get("origin")!==new URL(request.url).origin || !request.headers.get("content-type")?.startsWith("application/json")) return Response.json({error:"Request not allowed."},{status:403});
  const admin=await getAdmin(); if(!admin?.permissions.includes("orders.manage")) return Response.json({error:"Order management permission required."},{status:403});
  try {
    const raw=await request.text(); if(raw.length>4000) return Response.json({error:"Request too large."},{status:413});
    const body=JSON.parse(raw); if(!Number.isSafeInteger(body?.id)) return Response.json({error:"Invalid order."},{status:400});
    const order=await database().order.findUnique({where:{id:body.id}}); if(!order) return Response.json({error:"Order not found."},{status:404});
    if(body.action==="email") { if(!smtpReady()) return Response.json({error:"SMTP is not configured. The order is saved and its emails remain pending."},{status:409}); await deliverOrderEmails(order.id); }
    else if(body.action==="status" && ["PENDING","CONFIRMED","PROCESSING","COMPLETED","CANCELLED"].includes(body.status)) {
      if(body.updatedAt!==order.updatedAt.toISOString()) return Response.json({error:"Order changed. Refresh before updating."},{status:409});
      await database().$transaction(async(tx)=>{const changed=await tx.order.updateMany({where:{id:order.id,updatedAt:order.updatedAt},data:{status:body.status as OrderStatus}}); if(!changed.count) throw new Error("Conflict"); await tx.auditEvent.create({data:{actorId:admin.id,action:"order.status",entityType:"Order",entityId:String(order.id),changes:{from:order.status,to:body.status}}});});
    } else return Response.json({error:"Invalid action."},{status:400});
    revalidatePath("/admin/orders","layout"); return Response.json({message:body.action==="email" ? "Delivery attempted. Check each email status below." : "Order status updated."});
  }catch{return Response.json({error:"Unable to update order. Refresh and try again."},{status:500});}
}
