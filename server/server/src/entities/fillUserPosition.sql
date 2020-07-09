DELETE FROM user_position_entity;

INSERT INTO user_position_entity (id, pos_id, name, "parentId")
    VALUES (0, 0, 'Командир', 0);

INSERT INTO user_position_entity (id, pos_id, name, "parentId")
    VALUES (1, 1, 'Замісник1', 0);
INSERT INTO user_position_entity (id, pos_id, name, "parentId")
    VALUES (2, 2, 'Замісник2', 0);

INSERT INTO user_position_entity (id, pos_id, name, "parentId")
    VALUES (3, 3, 'Замісник11', 1);
INSERT INTO user_position_entity (id, pos_id, name, "parentId")
    VALUES (4, 4, 'Замісник12', 1);


    