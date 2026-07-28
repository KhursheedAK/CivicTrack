import { Repository } from 'typeorm';
import { Complaint } from '../../complaints/entities/complaint.entity';

export async function generateTrackingCode(
  complaintRepository: Repository<Complaint>,
): Promise<string> {
  const year = new Date().getFullYear();
  const yearStart = new Date(`${year}-01-01T00:00:00.000Z`);
  const yearEnd = new Date(`${year + 1}-01-01T00:00:00.000Z`);

  const count = await complaintRepository
    .createQueryBuilder('complaint')
    .where('complaint.created_at >= :yearStart', { yearStart })
    .andWhere('complaint.created_at < :yearEnd', { yearEnd })
    .getCount();

  const sequence = String(count + 1).padStart(5, '0');
  return `CMP-${year}-${sequence}`;
}
