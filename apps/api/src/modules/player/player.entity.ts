import { Column, Entity, ManyToOne } from 'typeorm';
import { Club } from '../club/club.entity';
import { Country } from '../country/country.entity';
import { BaseEntity } from 'src/infrastructure/database/base.entity';

@Entity('players')
export class Player extends BaseEntity {
  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ type: 'date', nullable: true })
  dateOfBirth?: Date;

  @Column({ nullable: true })
  heightCm?: number;

  @ManyToOne(() => Country, { nullable: true })
  nationality?: Country;

  @ManyToOne(() => Club, (club) => club.players, { nullable: true })
  club?: Club;
}
