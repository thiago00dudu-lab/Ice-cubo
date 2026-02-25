Fonte

Saída
api/mp_status.js

const MP = "https://api.mercadopago.com" ;   

módulo.exports = async ( req , res ) = > {     
  tentar { 
    const token = process.env.MP_ACCESS_TOKEN ;
    if ( ! token ) retorna res . estado ( 500 ) . json ( { ok : false , erro : "MP_ACCESS_TOKEN não configurado" } ) ;     

    const url = new URL ( req . url , "http://localhost" ) ;   
    const paymentId = url.searchParams.get ( " paymentId " ) ;
    if ( ! paymentId ) return res . status ( 400 ) . json ( { ok : false , error : "Passe ?paymentId=" } ) ;     

    const r = await fetch ( ` ${ MP } /v1/payments/ ${ paymentId } ` , {   
      cabeçalhos : { Authorization : ` Bearer ${ token } ` } ,    
    } ) ;

    const data = await r.json ( ) ; 
    if ( ! r . ok ) return res . status ( 400 ) . json ( { ok : false , error : data } ) ;   

    retornar res.status ( 200 ) .json ( {
      ok : verdadeiro , 
      id : dados.id ,
      status : dados . status ,
      valor : dados.valor_da_transação ,
    } ) ;
  } catch ( e ) {   
    retornar res.status ( 500 ) .json ( { ok : false , error : e.message } ) ;  
  }
} ;
json-zo7f – Implantações – Vercel
