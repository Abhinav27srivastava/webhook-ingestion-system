exports.up= (pgm)=>{
    pgm.addColumn('outbox_events',{
        claimed_at:{
            type:'timestamp',
        },
    });  
};   

exports.down=(pgm)=>{
    pgm.dropColumn('outbox_events','claimed_at');
};           
   
                                                  



