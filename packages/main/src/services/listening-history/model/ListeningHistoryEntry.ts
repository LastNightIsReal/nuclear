import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class ListeningHistoryEntry {
    @PrimaryGeneratedColumn("uuid")
    uuid: string;

    @Column('string')
    artist: string;

    @Column('title')
    title: string;

    @CreateDateColumn({
        precision: 3,
    })
    createdAt: Date;
}
