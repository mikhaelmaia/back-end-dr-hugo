import { AsyncLocalStorage } from 'node:async_hooks';
import { DataSource, EntityManager } from 'typeorm';

const transactionStorage = new AsyncLocalStorage<EntityManager>();

export const getCurrentTransactionManager = (): EntityManager | undefined =>
  transactionStorage.getStore();

/**
 * Executa `work` dentro de uma única transação. Todo repository que estende
 * `BaseRepository` e é chamado (direta ou indiretamente) por `work` passa a
 * usar a mesma transação, sem precisar receber o `EntityManager`.
 *
 * Se já houver uma transação em andamento, `work` participa dela.
 * Qualquer exceção lançada por `work` desfaz tudo o que foi gravado.
 *
 * Não dispare tarefas "fire-and-forget" que usem repository dentro de `work`:
 * elas herdariam a transação e podem rodar depois do commit.
 */
export const runInTransaction = <T>(
  dataSource: DataSource,
  work: () => Promise<T>,
): Promise<T> => {
  if (transactionStorage.getStore()) {
    return work();
  }

  return dataSource.transaction((manager) =>
    transactionStorage.run(manager, work),
  );
};
