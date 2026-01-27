import { Column, Entity, OneToMany } from 'typeorm';
import { Club } from '../club/club.entity';
import { BaseEntity } from 'src/infrastructure/database/base.entity';

@Entity('countries')
export class Country extends BaseEntity {
  @Column({ unique: true })
  name: string;

  @Column({ unique: true, length: 3 })
  code: string;

  @OneToMany(() => Club, (club) => club.country)
  clubs: Club[];
}
