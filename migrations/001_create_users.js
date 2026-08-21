
exports.up =(pgm)=>{
    //users table creation
  pgm.createTable('users',{
    id: {
        type: 'serial',
        primaryKey : true,
    },
    username:{
        type: 'varchar(100)',
        notNull: true,
        unique: true,
    },
    email: {
        type: 'varchar(255)',
        notNull:true,
        unique: true,
    },
    password:{
        type:'text',
        notNull:true,
    },
    created_at: {
      type: 'timestamp',
      default: pgm.func('CURRENT_TIMESTAMP'),
    },
  });   
};
exports.down =(pgm)=>{
    //users table rollback
    pgm.dropTable('users');
};