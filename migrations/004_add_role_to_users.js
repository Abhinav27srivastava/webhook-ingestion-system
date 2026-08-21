exports.up = (pgm)=>{
    pgm.addColumn('users', {
        role: {
            type: 'varchar(20)',
},
});
// now row exists before this migration will have null value for role column, so we need to update those rows with default value
    pgm.sql(`
        UPDATE users
        SET role = 'user'
        WHERE role IS NULL
    `);

    pgm.alterColumn('users', 'role', {
        notNull: true,
        default: 'user',

    });   
};
exports.down =(pgm)=>{
    pgm.dropColumn('users', 'role');
};

