import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import type { ApiResponse } from '../../../api-response';
import { StatusMessages } from '../../../status-messages';
import { accountResponse } from '../account-response';
import { sessionExpired, type M1Destination } from '../safe-return';
import { useM1Actions } from '../hooks/use-m1-actions';
import { M1Button } from '../components/m1-controls';
import { M1Navigation } from '../components/m1-navigation';
import { AccountNotices } from '../components/account-notices';
import { EmailChangePanel } from './email-change-panel';
import { OperatorPanel } from './operator-panel';
import { RecoveryPanel } from './recovery-panel';
import { RecoveryReviewPanel } from './recovery-review-panel';
import { m1Styles as styles } from '../m1-theme';
type Account = ApiResponse<'MAR_M1_API_003'>;
type Props = {
  account: Account;
  destination: M1Destination;
  onDestination: (route: M1Destination) => void;
  onAccount: (account: Account) => void;
  onExpired: (accountId: string, route: M1Destination) => void;
  onExit: (message?: string) => void;
};
export function AccountWorkspace(props: Props) {
  const { onExpired, account } = props;
  const [revision, setRevision] = useState(0);
  const route = useRef(props.destination);
  useEffect(() => {
    route.current = props.destination;
  }, [props.destination]);
  const expired = useCallback(() => onExpired(account.id, route.current), [onExpired, account.id]);
  const actions = useM1Actions(expired);
  const choose = (destination: M1Destination) => {
    route.current = destination;
    props.onDestination(destination);
  };
  const refresh = () =>
    void actions.run(async (request) => {
      props.onAccount(accountResponse(await request('/v1/me')));
      setRevision((value) => value + 1);
    });
  const logout = (all: boolean) =>
    void actions.run(async (request) => {
      try {
        await request(all ? '/v1/auth/sessions' : '/v1/auth/sessions/current', 'DELETE');
      } catch (cause) {
        if (!sessionExpired(cause)) throw cause;
      }
      props.onExit(all ? 'Todas las sesiones cerradas' : 'Sesión cerrada');
    });
  const notices = (
    <AccountNotices
      key={`notices:${props.account.id}:${revision}`}
      accountId={props.account.id}
      onSessionExpired={expired}
      styles={styles}
    />
  );
  return (
    <View style={styles.stack}>
      <StatusMessages {...actions} styles={styles} />
      {props.destination === 'avisos' ? (
        <View style={styles.stack}>
          <Text accessibilityRole="header" style={styles.title}>
            Avisos de cuenta
          </Text>
          <Text style={styles.body}>Avisos privados de tu cuenta.</Text>
          {notices}
          <M1Button label="Actualizar cuenta" onPress={refresh} busy={actions.busy} secondary />
        </View>
      ) : props.destination === 'ayuda' ? (
        <View style={styles.stack}>
          <Text accessibilityRole="header" style={styles.title}>
            Ayuda con tu acceso
          </Text>
          <Text style={styles.body}>
            Si perdiste tu buzón, recupéralo con su proveedor. Un comprobante vecinal no permite
            transferir tu cuenta.
          </Text>
          {props.account.operador ? (
            <View style={styles.stack}>
              <RecoveryPanel
                accountId={props.account.id}
                actions={actions}
                onExpired={expired}
                onCompleted={() =>
                  props.onExit(
                    'Segundo factor recuperado. Inicia sesión nuevamente y verifica tu autenticador.',
                  )
                }
              />
              <RecoveryReviewPanel accountId={props.account.id} actions={actions} />
            </View>
          ) : null}
        </View>
      ) : (
        <View style={styles.stack}>
          <Text accessibilityRole="header" style={styles.title}>
            Tu cuenta
          </Text>
          <Text style={styles.body}>{props.account.correo}</Text>
          <View style={styles.info}>
            <Text style={styles.body}>
              La pertenencia vecinal se revisará en el siguiente módulo. Esta cuenta todavía no
              permite comprar ni ofrecer.
            </Text>
          </View>
          <M1Button label="Actualizar cuenta" onPress={refresh} busy={actions.busy} />
          <M1Button
            label="Cerrar esta sesión"
            onPress={() => logout(false)}
            busy={actions.busy}
            secondary
          />
          <M1Button
            label="Cerrar todas las sesiones"
            onPress={() => logout(true)}
            busy={actions.busy}
            secondary
          />
          <EmailChangePanel
            key={`email:${props.account.id}:${revision}`}
            accountId={props.account.id}
            actions={actions}
            onExpired={expired}
            onBegin={() => choose('cambio_correo')}
            onCompleted={() =>
              props.onExit('Correo actualizado. Inicia sesión con el nuevo correo.')
            }
          />
          {props.account.operador ? <OperatorPanel actions={actions} onExpired={expired} /> : null}
          <Text accessibilityRole="header" style={styles.heading}>
            Avisos de cuenta
          </Text>
          {notices}
        </View>
      )}
      <M1Navigation destination={props.destination} onChange={choose} disabled={actions.busy} />
    </View>
  );
}
